# Retrospektiva sprintov

## Kaj je šlo dobro
- **Uvedba rezervacij vozil**: Uspešno smo dodali funkcionalnosti za rezervacijo vozil, vključno z omejitvijo rezervacij uporabnikov na eno vozilo, logiko za brisanje rezervacij in UI element za ogled rezervacij voznikov.
- **Admin funkcionalnosti**: Dodali smo vmesnik za pregled rezervacij, barvno shemo za stanja vozil (popravljeno in rezervirano) ter podprli več vlog (vozniki, managerji, administratorji).
- **Poenotenje terminologije**: Spremenili smo imena na angleščino, kar je izboljšalo konsistenco kode in uporabniškega vmesnika.
- **Izboljšave uporabniške izkušnje**: Dodali smo možnost odstranjevanja nepotrebne kode in CSS popravke za bolj intuitiven izgled prijave, registracije in nalaganja vozniške licence.

## S kakšnimi težavami smo se soočili
- **Konflikti med vejami**: Med združevanjem vej, kot sta `milos-vehicles-v2` in `main`, smo naleteli na konflikte, ki smo jih morali rešiti ročno.
- **Težave z ID-ji uporabnikov**: Pri rezervacijah se uporabniški ID ni pravilno vpisoval, kar je zahtevalo popravke v backend logiki.
- **Presežna koda**: Nekatere funkcionalnosti so bile implementirane z odvečnimi elementi, kar je otežilo vzdrževanje kode.
- **Preklop na okoljske spremenljivke**: Odstranjevanje občutljivih podatkov in dodajanje `env` datoteke je bilo nujno, vendar časovno zamudno.

## Kaj bi lahko izboljšali
- **Boljša komunikacija med ekipo**: Več predhodnega usklajevanja bi zmanjšalo število konfliktov pri združevanju vej.
- **Testiranje**: Potrebujemo bolj temeljito testiranje funkcionalnosti pred združevanjem v glavno vejo, da zmanjšamo število bugov.
- **Dokumentacija**: Bolj podrobna dokumentacija bi olajšala razumevanje kompleksnih funkcionalnosti, kot so rezervacije in vloge uporabnikov.
- **Optimizacija kode**: V prihodnje se bomo osredotočili na optimizacijo kode za boljše delovanje in zmanjšanje presežne kode.

## Zaključek
S sprintoma smo uspešno implementirali ključne funkcionalnosti za upravljanje rezervacij vozil ter podprli več vlog in uporabniških scenarijev. Kljub nekaterim težavam smo znotraj rokov dosegli zastavljene cilje. V prihodnje bomo izboljšali sodelovanje, dokumentacijo in testiranje, da bo razvoj še bolj učinkovit.
