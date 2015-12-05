#livetransit

A Google Maps overlay showing current locations of all TTC streetcars and buses. Opacity of points displayed represent the relative age of the location. A 100% opacity represents a location that was last updated 0s ago, and a 0% opacity represents a location that was last updated 60s ago. 

A working demo can be found at www.georgejose.com/projects/livetransit/map.html
Location data obtained from NextBus (https://www.nextbus.com/xmlFeedDocs/NextBusXMLFeed.pdf)

### How To Use 
- Install Node.js
- Install all required Node.js dependencies in the server folder
```bash
	cd server && npm install
```
- Start the application
```bash
	sudo node bin/www
```
- Navigate to http://localhost:500/map.html