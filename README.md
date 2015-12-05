#livetransit

A Google Maps overlay showing current locations of all TTC streetcars and buses. A working demo can be found at www.georgejose.com/projects/livetransit/map.html

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