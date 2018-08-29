# SDS011-Frontend
SDS011 Frontend made for Octoprint: https://github.com/sn4k3/Octoprint-SDS011

Adapted from: https://opensource.com/article/18/3/how-measure-particulate-matter-raspberry-pi

## 1. Instalation

First steps
 ```ssh
 sudo apt install git-core python-serial python-enum lighttpd
 sudo chown pi:pi /var/www/html/
 git clone https://github.com/sn4k3/SDS011-Frontend.git sds011temp 
 rsync -a sds011temp/* /var/www/html/
 rm -rf sds011temp
 chmod +x /var/www/html/aqi.py
 echo [] > /var/www/html/aqi.json
  
 ```
 
 To test if the aqi.py script is OK you can run:
 
 ``python /var/www/html/aqi.py``
 (You need to force quit when you ready, CTRL + C)
 
 Run the script automatically so that we don’t have to start the script manually every time, we can let it start with a cronjob, e.g., with every restart of the Raspberry Pi. To do this, open the crontab file:
 
 ``crontab -e``
 
 and add the following line at the end:
 
 ``@reboot python /var/www/html/aqi.py &``
 
 Now we must confirure the http server, open the configuration file with:
 
 ``sudo nano /etc/lighttpd/lighttpd.conf``
 
 Then edit "server.port", i use 81, but you can choose.
 
 ``server.port                 = 81``
 
 Save, exit and reboot.
 
 ``sudo reboot``
 
 Now it must display the page, go to your web browser and test, eg:
 
 ```
 http://octopi.local:81
 OR
 http://IP:81
 ```
 
 ## 2. Configuration
 
 There are small things that you can adjust:
 
 **/var/www/html/aqi.py**
 
 Note: Changes under this file require a reboot or kill the process and re run. 
 
````python
SERIALPORT = "/dev/ttyUSB0" # USB port where SDS011 is
# This will influence the accuracy and speed of readings, keep a good balance
# Less reads = Less precision and fast
# More reads = More precision and slow
# After measurements the sensor, laser and fan will be turn off for 'UPDATE_FREQUENCY' time, this will increase the lifespan of the sensor.
READINGS = 10  # Number of readings, this will not perform an AVG, only the last read will be used as value.
SLEEP_BETWEEN_READS = 2  # Time to sleep in seconds between each read, total read time will be READINGS x SLEEP_BETWEEN_READS.
UPDATE_FREQUENCY = 60  # Update frequency in seconds, new measurements after that time.
# If UPDATE_FREQUENCY = 0, the sensor will never turn off, this will wear your sensor much faster.
# (according to the manufacturer, the lifespan totals approximately 8000 hours).
STORED_READ_NUM = 100   # Maximum number of readings to plot or store, when max is reached, the oldest read will be removed.
````

**/var/www/html/index.html**

````html
<!-- Page refresh frequency in seconds, remove line or comment for manual refresh -->
<meta http-equiv="refresh" content="20">
````

## 3. Update

If you wish to update/reset your frontend and lose any changes you have made:

````ssh
git clone https://github.com/sn4k3/SDS011-Frontend.git sds011temp 
rsync -a sds011temp/* /var/www/html/
rm -rf sds011temp
chmod +x /var/www/html/aqi.py

````