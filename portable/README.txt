TRAIL AFRICA — offline copies
==============================================

TWO DIFFERENT THINGS SIT IN THIS FOLDER. PICK THE RIGHT ONE.

1) trail-offline.html        <- START HERE to put it on a USB stick
   ONE file, 0.66 MB. Double-click it. That is the whole procedure.
   JavaScript, CSS, both fonts and the Africa map geometry are all
   inside that one file, so the app boots with nothing requested.
   No install, no server, no internet, no admin rights.
   NOTE: detailed facility layers (health, schools, power, markets)
   need the folder build below — browsers cannot load separate
   module chunks from file://, so the single file shows official
   trails, issues and the map, but not the facility pins.

2) trail-offline/            <- a FOLDER, for serving
   index.html plus an assets/ folder. This one does NOT work by
   double-clicking: browsers block module scripts and stylesheets
   loaded from file:// (the page origin is null, so the request counts
   as cross-origin). Serve it instead:

       cd trail-offline
       python -m http.server 8000
       open http://localhost:8000

   Use this form for a web deployment, for the full facility layers,
   or when you want the offline app cache (service workers only run
   over http/https).

WHAT WORKS OFFLINE (folder build)
---------------------------------
Everything: the map, the facility layers, the community issues and
votes, the trail files, the packet export, and the report form.

WHAT NEEDS A CONNECTION
-----------------------
Only the three share buttons that hand text to another app (WhatsApp,
Telegram) and the external links in the Sources tab. The app shows an
OFFLINE badge in the header when you are not connected.

PRIVACY
-------
There is no server and no account. Nothing you type is transmitted.
Trails, issues, votes and reports are stored in this browser's local
storage on this machine only. "Clear this device" in the Report tab
erases them.

On a shared or public computer, anything you enter stays on that machine
until you clear it. Use a device you control for anything sensitive, and
for a report that could put you at risk use a trusted organisation's
secure channel instead of this app.

DATA
----
Data bundle: 21 Sep 2026. Covers 13 countries in Africa. Each record shows its own source, the date that
source was last checked, and what the record does not tell you. A source
that has not been checked is shown as unchecked, not as verified.

Built 2026-09-21.
