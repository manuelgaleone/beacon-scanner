import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Platform,
  PermissionsAndroid,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import Kontakt, { KontaktModule } from 'react-native-kontaktio';
import * as Location from 'expo-location';
import { NativeEventEmitter } from 'react-native';

const { connect, startScanning, stopScanning } = Kontakt;
const kontaktEmitter = new NativeEventEmitter(KontaktModule);

interface Beacon {
  uuid: string;
  major: number;
  minor: number;
  rssi: number;
  proximity: string;
  accuracy: number;
  timestamp: number;
}

interface KontaktBeacon {
  uuid?: string;
  proximityUUID?: string;
  major?: number;
  minor?: number;
  rssi?: number;
  proximity?: string;
  accuracy?: number;
}

interface BeaconDiscoveryEvent {
  beacons: KontaktBeacon[];
}

export default function App() {
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    requestPermissions();
    return () => {
      if (isScanning) {
        stopScanning();
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      // Request Location Permission (required for BLE scanning)
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to scan for beacons');
        setIsLoading(false);
        return;
      }

      // Request Bluetooth permissions on Android 12+
      if (Platform.OS === 'android') {
        if (Platform.Version >= 31) {
          const bluetoothScanPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
              title: 'Bluetooth Scan Permission',
              message: 'This app needs Bluetooth scan permission to detect beacons',
              buttonPositive: 'OK',
            }
          );
          
          const bluetoothConnectPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
              title: 'Bluetooth Connect Permission',
              message: 'This app needs Bluetooth connect permission',
              buttonPositive: 'OK',
            }
          );

          if (
            bluetoothScanPermission !== PermissionsAndroid.RESULTS.GRANTED ||
            bluetoothConnectPermission !== PermissionsAndroid.RESULTS.GRANTED
          ) {
            Alert.alert('Permission Denied', 'Bluetooth permissions are required');
            setIsLoading(false);
            return;
          }
        }

        const fineLocationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs location permission to scan for beacons',
            buttonPositive: 'OK',
          }
        );

        if (fineLocationPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Fine location permission is required');
          setIsLoading(false);
          return;
        }
      }

      setHasPermissions(true);
      await initializeKontakt();
      setIsLoading(false);
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request permissions');
      setIsLoading(false);
    }
  };

  const initializeKontakt = async () => {
    try {
      await connect();
      console.log('Kontakt SDK connected');
    } catch (error) {
      console.error('Kontakt SDK connection error:', error);
      Alert.alert('Error', 'Failed to initialize Cosmo IBeacon');
    }
  };

  const startBeaconScanning = async () => {
    if (!hasPermissions) {
      Alert.alert('No Permissions', 'Please grant the required permissions first');
      return;
    }

    try {
      setIsScanning(true);
      setBeacons([]);

      // Start scanning for beacons
      await startScanning();

      // Listen for beacon discoveries
      kontaktEmitter.addListener('didDiscoverDevices', (event: BeaconDiscoveryEvent) => {
        const discoveredBeacons = event.beacons;
        if (discoveredBeacons && discoveredBeacons.length > 0) {
          const formattedBeacons = discoveredBeacons.map((beacon: KontaktBeacon) => ({
            uuid: beacon.uuid || beacon.proximityUUID || 'Unknown',
            major: beacon.major || 0,
            minor: beacon.minor || 0,
            rssi: beacon.rssi || 0,
            proximity: beacon.proximity || 'unknown',
            accuracy: beacon.accuracy || 0,
            timestamp: Date.now(),
          }));

          // Update beacons list, removing duplicates
          setBeacons((prevBeacons) => {
            const updatedBeacons = [...formattedBeacons];
            
            // Merge with previous beacons, keeping the most recent data
            prevBeacons.forEach((prevBeacon) => {
              const exists = formattedBeacons.find(
                (b: Beacon) => b.uuid === prevBeacon.uuid && 
                       b.major === prevBeacon.major && 
                       b.minor === prevBeacon.minor
              );
              if (!exists) {
                // Keep old beacon if not in new scan (might still be nearby)
                if (Date.now() - prevBeacon.timestamp < 5000) {
                  updatedBeacons.push(prevBeacon);
                }
              }
            });

            return updatedBeacons;
          });
        }
      });

    } catch (error) {
      console.error('Scanning error:', error);
      Alert.alert('Error', 'Failed to start scanning');
      setIsScanning(false);
    }
  };

  const stopBeaconScanning = async () => {
    try {
      await stopScanning();
      kontaktEmitter.removeAllListeners('didDiscoverDevices');
      setIsScanning(false);
    } catch (error) {
      console.error('Stop scanning error:', error);
    }
  };

  const getDistanceColor = (rssi: number, accuracy: number) => {
    // RSSI typically ranges from -30 (very close) to -100 (far)
    // Accuracy is in meters
    
    if (accuracy < 1 || rssi > -50) {
      return '#4CAF50'; // Green - Very close (< 1m)
    } else if (accuracy < 3 || rssi > -70) {
      return '#FFC107'; // Yellow - Medium distance (1-3m)
    } else {
      return '#F44336'; // Red - Far (> 3m)
    }
  };

  const getDistanceText = (rssi: number, accuracy: number) => {
    if (accuracy < 1 || rssi > -50) {
      return 'Very Close';
    } else if (accuracy < 3 || rssi > -70) {
      return 'Medium';
    } else {
      return 'Far';
    }
  };

  const renderBeacon = ({ item }: { item: Beacon }) => (
    <View style={styles.beaconCard}>
      <View style={styles.beaconHeader}>
        <View 
          style={[
            styles.statusIndicator, 
            { backgroundColor: getDistanceColor(item.rssi, item.accuracy) }
          ]} 
        />
        <Text style={styles.distanceText}>
          {getDistanceText(item.rssi, item.accuracy)}
        </Text>
      </View>
      
      <View style={styles.beaconInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>UUID:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {item.uuid}
          </Text>
        </View>
        
        <View style={styles.beaconMetrics}>
          <View style={styles.metric}>
            <Text style={styles.label}>Major</Text>
            <Text style={styles.metricValue}>{item.major}</Text>
          </View>
          
          <View style={styles.metric}>
            <Text style={styles.label}>Minor</Text>
            <Text style={styles.metricValue}>{item.minor}</Text>
          </View>
          
          <View style={styles.metric}>
            <Text style={styles.label}>RSSI</Text>
            <Text style={styles.metricValue}>{item.rssi} dBm</Text>
          </View>
          
          <View style={styles.metric}>
            <Text style={styles.label}>Distance</Text>
            <Text style={styles.metricValue}>
              {item.accuracy > 0 ? `${item.accuracy.toFixed(2)}m` : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Cosmo IBeacon</Text>
        <Text style={styles.subtitle}>
          {isScanning ? `Found ${beacons.length} beacon(s)` : 'Press start to scan'}
        </Text>
      </View>

      <FlatList
        data={beacons}
        renderItem={renderBeacon}
        keyExtractor={(item, index) => `${item.uuid}-${item.major}-${item.minor}-${index}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isScanning ? 'Scanning for beacons...' : 'No beacons found'}
            </Text>
            {isScanning && <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />}
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            isScanning ? styles.buttonStop : styles.buttonStart,
            !hasPermissions && styles.buttonDisabled
          ]}
          onPress={isScanning ? stopBeaconScanning : startBeaconScanning}
          disabled={!hasPermissions}
        >
          <Text style={styles.buttonText}>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </Text>
        </TouchableOpacity>

        {!hasPermissions && (
          <TouchableOpacity
            style={[styles.button, styles.buttonPermission]}
            onPress={requestPermissions}
          >
            <Text style={styles.buttonText}>Request Permissions</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  beaconCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  beaconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  beaconInfo: {
    gap: 12,
  },
  infoRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  beaconMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonStart: {
    backgroundColor: '#4CAF50',
  },
  buttonStop: {
    backgroundColor: '#F44336',
  },
  buttonPermission: {
    backgroundColor: '#2196F3',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
