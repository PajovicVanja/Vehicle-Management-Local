// frontend/src/components/VehicleSearch.js
import React from "react";

const Field = ({ label, children }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <span style={{ fontSize: 12, opacity: 0.8 }}>{label}</span>
    {children}
  </label>
);

function VehicleSearch({ filters, setFilters, onClear }) {
  const set = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12,
        alignItems: "end",
        marginBottom: 12,
      }}
    >
      <Field label="Name contains">
        <input
          type="text"
          value={filters.name || ""}
          onChange={set("name")}
          placeholder="e.g. Golf"
        />
      </Field>

      <Field label="Color contains">
        <input
          type="text"
          value={filters.color || ""}
          onChange={set("color")}
          placeholder="e.g. red"
        />
      </Field>

      <Field label="Engine contains">
        <input
          type="text"
          value={filters.engine || ""}
          onChange={set("engine")}
          placeholder="e.g. V6, I4"
        />
      </Field>

      <Field label="Year (min)">
        <input
          type="number"
          inputMode="numeric"
          value={filters.yearMin || ""}
          onChange={set("yearMin")}
          placeholder="e.g. 2018"
        />
      </Field>

      <Field label="Year (max)">
        <input
          type="number"
          inputMode="numeric"
          value={filters.yearMax || ""}
          onChange={set("yearMax")}
          placeholder="e.g. 2022"
        />
      </Field>

      <Field label="HP (min)">
        <input
          type="number"
          inputMode="numeric"
          value={filters.hpMin || ""}
          onChange={set("hpMin")}
          placeholder="e.g. 150"
        />
      </Field>

      <Field label="HP (max)">
        <input
          type="number"
          inputMode="numeric"
          value={filters.hpMax || ""}
          onChange={set("hpMax")}
          placeholder="e.g. 250"
        />
      </Field>

      <button
        type="button"
        className="goto-register-button"
        onClick={onClear}
        style={{ height: 38 }}
      >
        Clear
      </button>
    </div>
  );
}

export default VehicleSearch;
