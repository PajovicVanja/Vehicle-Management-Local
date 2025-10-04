// api/__tests__/helpers/mockDb.js

// Very small Firestore-in-memory mock that supports the subset of features
// your handlers/tests use: collection().doc().{get,set,update,delete},
// collection().get(), collection().where(...).where(...).get(),
// and db.batch().delete(ref).commit().
//
// Key detail: every doc "ref" includes a pointer to its parent collection
// via `ref._collection`, so batch.delete(ref) can mutate the correct store.

let autoId = 0;
const genId = () => `auto_${++autoId}`;

function createCollection(initial = {}) {
  const store = new Map(Object.entries(initial)); // id -> data

  // Query wrapper that shares the same underlying store and applies filters.
  function makeQuery(col, filters = []) {
    return {
      _name: col._name,
      _filters: filters,
      _getData: () => store,
      where(field, op, value) {
        if (op !== '==') throw new Error('mockDb only supports == in where()');
        return makeQuery(col, [...this._filters, { field, op, value }]);
      },
      async get() {
        const filtered = Array.from(store.entries()).filter(([, data]) =>
          this._filters.every(f => (f.op === '==' ? data[f.field] === f.value : false))
        );
        const docs = filtered.map(([id, data]) => ({
          id,
          data: () => data,
          // include the originating collection so batch.delete can work
          ref: { id, _collection: col }
        }));
        return { docs, empty: docs.length === 0, forEach: cb => docs.forEach(cb) };
      }
    };
  }

  const col = {
    _name: null,
    _filters: [],
    // expose underlying map so batch.delete can mutate it
    _getData: () => store,

    doc(id) {
      const _id = id || genId();
      return {
        id: _id,
        async get() {
          const exists = store.has(_id);
          return { id: _id, exists, data: () => (exists ? store.get(_id) : undefined) };
        },
        async set(data) {
          store.set(_id, { ...(data || {}) });
        },
        async update(patch) {
          if (!store.has(_id)) throw new Error('not-found');
          store.set(_id, { ...store.get(_id), ...(patch || {}) });
        },
        async delete() {
          store.delete(_id);
        },
        get ref() {
          // IMPORTANT: keep a pointer back to the collection
          return { id: _id, _collection: col };
        }
      };
    },

    where(field, op, value) {
      if (op !== '==') throw new Error('mockDb only supports == in where()');
      return makeQuery(col, [{ field, op, value }]);
    },

    async get() {
      const docs = Array.from(store.entries()).map(([id, data]) => ({
        id,
        data: () => data,
        ref: { id, _collection: col }
      }));
      return { docs, empty: docs.length === 0, forEach: cb => docs.forEach(cb) };
    }
  };

  return col;
}

function createMockDb(seed = {}) {
  const collections = {};
  const ensure = (name) => {
    if (!collections[name]) {
      collections[name] = createCollection(seed[name] || {});
      collections[name]._name = name;
    }
    return collections[name];
  };

  return {
    collection(name) {
      return ensure(name);
    },

    batch() {
      const ops = [];
      return {
        delete(ref) {
          ops.push({ type: 'delete', ref });
        },
        async commit() {
          for (const op of ops) {
            if (op.type === 'delete') {
              const col = op.ref && op.ref._collection;
              if (!col) continue; // nothing to do if no collection pointer
              const map = col._getData ? col._getData() : null;
              if (map) map.delete(op.ref.id);
            }
          }
        }
      };
    }
  };
}

module.exports = { createMockDb };
