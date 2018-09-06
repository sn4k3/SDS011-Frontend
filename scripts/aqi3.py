#!/usr/bin/python3
# coding=utf-8
import sys
import json
import time
from sds011 import SDS011

# CONFIGURATION
SERIALPORT = "/dev/ttyUSB0"  # USB port where SDS011 is
# This will influence the accuracy and speed of readings, keep a good balance
# Less reads = Less precision and fast
# More reads = More precision and slow
# After measurements the sensor, laser and fan will be turn off for 'UPDATE_FREQUENCY' time, this will increase the lifespan of the sensor.
READINGS = 5  # Number of readings, this will not perform an AVG, only the last read will be used as value.
SLEEP_BEFORE_FIRST_READ = 15  # Time to wait in seconds after sensor awake and before the first read. Give sometime for the sensor stabilize
SLEEP_BETWEEN_READS = 2  # Time to sleep in seconds between each read, total read time will be READINGS x SLEEP_BETWEEN_READS.
UPDATE_FREQUENCY = 60  # Update frequency in seconds, new measurements after that time.
# If UPDATE_FREQUENCY = 0, the sensor will never turn off, this will wear your sensor much faster.
# (according to the manufacturer, the lifespan totals approximately 8000 hours).
STORED_READ_NUM = 100  # Maximum number of readings to plot or store, when max is reached, the oldest read will be removed.


def logcmd(text):
    if 'debug' in sys.argv:
        print(text)


# Don't change
DATA_FILE = '/var/www/html/assets/aqi.json'
if __name__ == "__main__":
    sensor = SDS011(SERIALPORT, use_query_mode=True)
    if 'stop' in sys.argv:
        sensor.sleep()  # Turn off fan and diode
    else:
        while True:
            logcmd("Awaking sensor and wait " + str(SLEEP_BEFORE_FIRST_READ) + "s before query.")
            sensor.sleep(sleep=False)  # Turn on fan and diode
            time.sleep(SLEEP_BEFORE_FIRST_READ)

            values = None
            for t in range(READINGS):
                time.sleep(SLEEP_BETWEEN_READS)
                values = sensor.query()
                if values is not None and len(values) == 2:
                    logcmd(str(t + 1) + "# PM2.5: " + str(values[0]) + ", PM10: " + str(values[1]))

            if values is not None and len(values) == 2:
                # open stored data
                with open(DATA_FILE) as json_data:
                    data = json.load(json_data)

                # check if length is more than STORED_READ_NUM and delete first/oldest element
                while len(data) > STORED_READ_NUM:
                    data.pop(0)

                # append new values
                data.append({'pm25': values[0], 'pm10': values[1], 'time': time.strftime("%d-%m-%Y %H:%M:%S")})

                # save it
                with open(DATA_FILE, 'w') as outfile:
                    json.dump(data, outfile)

            if UPDATE_FREQUENCY > 0:
                logcmd("Going to sleep for " + str((UPDATE_FREQUENCY / 60)) + " min...")
                sensor.sleep()  # Turn off fan and diode
                time.sleep(UPDATE_FREQUENCY)
