# SDS011-Frontend
SDS011 Frontend made for Octoprint: https://github.com/sn4k3/Octoprint-SDS011

Adapted from: https://opensource.com/article/18/3/how-measure-particulate-matter-raspberry-pi

## 1. Instalation

First steps
 ```ssh
sudo apt install git-core python-serial python-enum lighttpd pip3
pip3 install https://github.com/ikalchev/py-sds011/archive/master.zip
sudo pip3 install https://github.com/ikalchev/py-sds011/archive/master.zip
sudo chown $USER:$USER /var/www/html/
sudo chgrp -R $USER /var/www/html
sudo usermod -a -G www-data 
sudo usermod -a -G $USER www-data
git clone https://github.com/sn4k3/SDS011-Frontend.git sds011temp
rsync -a sds011temp/* /var/www/html/
rm -rf sds011temp
chmod +x /var/www/html/scripts/aqi.py
chmod +x /var/www/html/scripts/aqi3.py
echo [] > /var/www/html/assets/aqi.json
sudo chmod 664 /var/www/html/assets/aqi.json
sudo lighttpd-enable-mod cgi
sudo service lighttpd stop
sudo chown -R $USER:$USER /var/log/lighttpd
sudo chown -R $USER:$USER /var/run/lighttpd
sudo chown -R $USER:$USER /var/cache/lighttpd

 ```
 
 To test if the aqi.py script is OK you can run:
 
 ``python3 /var/www/html/scripts/aqi3.py debug``
 (You need to force quit when you ready, CTRL + C)
 
 Run the script automatically so that we don’t have to start the script manually every time, we can let it start with a cronjob, e.g., with every restart of the Raspberry Pi. To do this, open the crontab file:
 
 ``crontab -e``
 
 and add the following line at the end:
 
 ``@reboot python3 /var/www/html/scripts/aqi3.py start > /dev/null 2>&1 &``
 
 Otherwise if you prefer to start the sensor manually from web use the following line to put sensor at sleep each boot:
 
  ``@reboot python3 /var/www/html/scripts/aqi3.py stop > /dev/null 2>&1 &``
  
   
 Now we must configure the http server, open the configuration file with:
 
 ``sudo nano /etc/lighttpd/lighttpd.conf``
 
 Add ``"mod_expire"`` to "server_modules".
 
 Add this section:
 
 ````text
expire.url = (
    "/assets/" => "access 0 days",
    "/index.html" => "access 0 days"
)
````
 
 Modify "server.port", i use 81, but you can choose.
 
 Modify "server.username", and "server.groupname" to pi
 
 ````
server.port                 = 81
server.username             = "pi"
server.groupname            = "pi"
````

Modify /etc/init.d/lighttpd. Change 'www-data' to 'pi'.

````ssh
sudo nano /etc/init.d/lighttpd
    from: install -d -o www-data -g www-data -m 0750 "/var/run/lighttpd" 
      to: install -d -o pi -g pi -m 0750 "/var/run/lighttpd"
````

Modify /usr/lib/tmpfiles.d/lighttpd.tmpfile.conf and change www-data to pi.

````ssh
sudo nano /usr/lib/tmpfiles.d/lighttpd.tmpfile.conf
  from: d /var/run/lighttpd 0750 www-data www-data -
    to: d /var/run/lighttpd 0750 pi pi -
````
 
 
Modify '/etc/lighttpd/conf-enabled/10-cgi.conf' with ``sudo nano /etc/lighttpd/conf-enabled/10-cgi.conf`` and put the content:
 
 ````
server.modules += ( "mod_cgi" )

$HTTP["url"] =~ "^/cgi-bin/" {
        alias.url += ( "/cgi-bin/" => "/var/www/html/cgi-bin/" )
        cgi.assign = (
                ".py"  => "/usr/bin/python3",
        )
}
````
 
 Save, exit and reboot:  ``sudo reboot``
 
 Now it must display the page, go to your web browser and test, eg:
 
 ```
 http://octopi.local:81
 OR
 http://IP:81
 ```
 
 ## 2. Configuration
 
 There are small things that you can adjust:
 
 **/var/www/html/scripts/aqi3.py**
 
 Note: Changes under this file require a reboot or kill the process and re run. 
 
````python
SERIALPORT = "/dev/ttyUSB0" # USB port where SDS011 is
# This will influence the accuracy and speed of readings, keep a good balance
# Less reads = Less precision and fast
# More reads = More precision and slow
# After measurements the sensor, laser and fan will be turn off for 'UPDATE_FREQUENCY' time, this will increase the lifespan of the sensor.
READINGS = 5                        # Number of readings, this will not perform an AVG, only the last read will be used as value.
SLEEP_BEFORE_FIRST_READ = 10        # Time to wait in seconds after sensor awake and before the first read. Give sometime for the sensor stabilize
SLEEP_BETWEEN_READS = 2             # Time to sleep in seconds between each read, total read time will be READINGS x SLEEP_BETWEEN_READS.
UPDATE_FREQUENCY = 60               # Update frequency in seconds, new measurements after that time.
# If UPDATE_FREQUENCY = 0, the sensor will never turn off, this will wear your sensor much faster.
# (according to the manufacturer, the lifespan totals approximately 8000 hours).
STORED_READ_NUM = 100               # Maximum number of readings to plot or store, when max is reached, the oldest read will be removed.
````

**/var/www/html/assets/aqi.js**

````javascript
var AQI_CONFIG = {
    UPDATE_FREQUENCY        : 60,	// Default seconds to auto refresh the data if not specified by the user via url.
    MIN_UPDATE_FREQUENCY    : 10,	// Min seconds for the refresh frequency, must be greater than 1, if user use lower than that, the value will be set to this.
    SHOW_AQI                : true,	// Show AQI index values by default or only pm values

    GRAPH_WIDTH             : 720,  // Set the graph width, note the graph is responsive
    GRAPH_HEIGHT            : 420,  // Set the graph height, note the graph is responsive
    GRAPH_MAX_DOTS          : 50,   // Set the max dots to show on the graph
};

````

**URL Parameters**

Use url parameters like: http://url:port/?param1=value&param2=othervalue&param3=value

````
refresh=60      // Seconds to auto refresh the data, use 0 for manual refresh only. if not set AQI_DEFAULT_UPDATE_FREQUENCY will be used.
showaqi=0       // Show AQI index values or only pm values
graphwidth=720  // Set the graph width, note the graph is responsive
graphheight=400 // Set the graph height, note the graph is responsive
graphdots=50    // Set the max dots to show on the graph
````

**API AQI**

URL: http://url:port/cgi-bin/aqiapi.py?action=xxx

Replace 'xxx' with a action:
````text
start       # Start sensor
stop        # Stop sensor
resetdata   # Reset the collected data
````

## 3. Update

If you wish to update/reset your frontend and lose any changes you have made:

````ssh
git clone https://github.com/sn4k3/SDS011-Frontend.git sds011temp 
rsync -a sds011temp/* /var/www/html/
rm -rf sds011temp
chmod +x /var/www/html/scripts/aqi.py
chmod +x /var/www/html/scripts/aqi3.py

````