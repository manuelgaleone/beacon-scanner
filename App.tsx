import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
  DeviceEventEmitter,
  Animated
} from 'react-native';
import Kontakt, { KontaktModule } from 'react-native-kontaktio';
import * as Location from 'expo-location';
import { NativeEventEmitter } from 'react-native';

const { 
  connect, 
  init, 
  startScanning, 
  stopScanning, 
  startDiscovery, 
  stopDiscovery,
  startRangingBeaconsInRegion,
  stopRangingBeaconsInRegion
} = Kontakt;
const kontaktEmitter = new NativeEventEmitter(KontaktModule);
const isAndroid = Platform.OS === 'android';

// Common beacon UUIDs to scan for (iOS only)
// Add more UUIDs here if you have beacons with different UUIDs
const COMMON_BEACON_UUIDS = [
  { identifier: 'Kontakt', uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e' }, // Kontakt.io
  { identifier: 'Estimote', uuid: 'B9407F30-F5F8-466E-AFF9-25556B57FE6D' }, // Estimote
  { identifier: 'AirLocate', uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0' }, // Apple AirLocate
  { identifier: 'RadBeacon', uuid: '2F234454-CF6D-4A0F-ADF2-F4911BA9FFA6' }, // RadBeacon
  { identifier: 'Radius', uuid: '8AEFB031-6C32-486F-825B-E26FA193487D' }, // Radius Networks
  { identifier: 'BlueUp', uuid: 'ACFD065E-C3C0-11E3-9BBE-1A514932AC01' }, // BlueUp
  // Add your custom UUID here if needed:
  // { identifier: 'Custom', uuid: 'YOUR-UUID-HERE' },
];

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
      // Cleanup on unmount
      if (isScanning) {
        stopBeaconScanning();
      }
      if (isAndroid) {
        DeviceEventEmitter.removeAllListeners('beaconsDidUpdate');
      } else {
        kontaktEmitter.removeAllListeners('didDiscoverDevices');
        kontaktEmitter.removeAllListeners('didRangeBeacons');
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
      if (isAndroid) {
        await connect();
        console.log('Kontakt SDK connected (Android)');
      } else {
        await init();
        console.log('Kontakt SDK initialized (iOS)');
      }
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

      // Start scanning for beacons based on platform
      if (isAndroid) {
        await startScanning();
        
        // Android event listener
        DeviceEventEmitter.addListener('beaconsDidUpdate', ({ beacons: discoveredBeacons, region }: any) => {
          console.log('Android beacons discovered:', discoveredBeacons?.length);
          if (discoveredBeacons && discoveredBeacons.length > 0) {
            updateBeaconsList(discoveredBeacons);
          }
        });
      } else {
        // iOS - Scan for beacons with multiple common UUIDs
        // Since iOS requires UUID for ranging, we add the most common beacon UUIDs
        
        // Start discovery for Kontakt.io beacons (works without UUID)
        await startDiscovery();
        console.log('Started discovery for Kontakt.io beacons');
        
        // Start ranging for each common UUID to detect ANY beacon type
        for (const beacon of COMMON_BEACON_UUIDS) {
          try {
            await startRangingBeaconsInRegion({
              identifier: beacon.identifier,
              uuid: beacon.uuid,
            });
            console.log(`Started ranging for ${beacon.identifier} beacons`);
          } catch (error) {
            console.log(`Could not start ranging for ${beacon.identifier}:`, error);
          }
        }
        
        // iOS event listeners
        kontaktEmitter.addListener('didDiscoverDevices', ({ beacons: discoveredBeacons }: any) => {
          console.log('iOS didDiscoverDevices:', discoveredBeacons?.length);
          if (discoveredBeacons && discoveredBeacons.length > 0) {
            updateBeaconsList(discoveredBeacons);
          }
        });
        
        kontaktEmitter.addListener('didRangeBeacons', ({ beacons: discoveredBeacons, region }: any) => {
          console.log('iOS didRangeBeacons in region', region?.identifier, ':', discoveredBeacons?.length);
          if (discoveredBeacons && discoveredBeacons.length > 0) {
            updateBeaconsList(discoveredBeacons);
          }
        });
        
        console.log(`iOS scanning started for ${COMMON_BEACON_UUIDS.length} beacon types`);
      }

    } catch (error) {
      console.error('Scanning error:', error);
      Alert.alert('Error', 'Failed to start scanning');
      setIsScanning(false);
    }
  };

  const updateBeaconsList = (discoveredBeacons: KontaktBeacon[]) => {
    console.log('Updating beacons list with:', discoveredBeacons.length, 'beacons');
    
    const formattedBeacons = discoveredBeacons
      .filter((beacon: KontaktBeacon) => {
        // Filtra beacon con RSSI = 0 (valore anomalo)
        const rssi = beacon.rssi || 0;
        if (rssi === 0) {
          console.log('Skipping beacon with RSSI = 0:', beacon.uuid);
          return false;
        }
        return true;
      })
      .map((beacon: KontaktBeacon, index: number) => {
        console.log(`Beacon ${index}:`, JSON.stringify(beacon, null, 2));
        
        return {
          uuid: beacon.uuid || beacon.proximityUUID || 'Unknown',
          major: beacon.major || 0,
          minor: beacon.minor || 0,
          rssi: beacon.rssi || -100, // Default a valore molto basso se undefined
          proximity: beacon.proximity || 'unknown',
          accuracy: beacon.accuracy || 0,
          timestamp: Date.now(),
        };
      });

    console.log('Formatted beacons:', formattedBeacons.length);

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

      // Ordina per RSSI (più alto = più vicino) - RSSI più vicino a 0 = segnale più forte
      updatedBeacons.sort((a, b) => b.rssi - a.rssi);

      console.log('Total beacons after merge and sort:', updatedBeacons.length);
      if (updatedBeacons.length > 0) {
        console.log('Closest beacon RSSI:', updatedBeacons[0].rssi);
      }
      
      return updatedBeacons;
    });
  };

  const stopBeaconScanning = async () => {
    try {
      if (isAndroid) {
        await stopScanning();
        DeviceEventEmitter.removeAllListeners('beaconsDidUpdate');
      } else {
        // Stop discovery
        await stopDiscovery();
        
        // Stop ranging for all common UUIDs
        for (const beacon of COMMON_BEACON_UUIDS) {
          try {
            await stopRangingBeaconsInRegion({
              identifier: beacon.identifier,
              uuid: beacon.uuid,
            });
            console.log(`Stopped ranging for ${beacon.identifier}`);
          } catch (error) {
            console.log(`Could not stop ranging for ${beacon.identifier}:`, error);
          }
        }
        
        kontaktEmitter.removeAllListeners('didDiscoverDevices');
        kontaktEmitter.removeAllListeners('didRangeBeacons');
      }
      setIsScanning(false);
      console.log('Scanning stopped');
    } catch (error) {
      console.error('Stop scanning error:', error);
    }
  };

  /**
   * Calcola la distanza dal beacon basandosi sull'RSSI
   * Formula: distance = 10 ^ ((txPower - RSSI) / (10 * n))
   * 
   * @param rssi - Received Signal Strength Indicator (dBm)
   * @param txPower - Potenza di trasmissione a 1 metro (default: -59 dBm)
   * @param n - Fattore di attenuazione del segnale (2-4, default: 2.5 per ambienti interni)
   * @returns distanza in metri
   */
  const calculateDistance = (rssi: number, txPower: number = -59, n: number = 2.5): number => {
    if (rssi === 0) {
      return -1; // Valore non valido
    }
    
    // Formula per calcolare la distanza
    const distance = Math.pow(10, (txPower - rssi) / (10 * n));
    
    return distance;
  };

  const getDistanceColor = (rssi: number) => {
    const distance = calculateDistance(rssi);
    
    // Classificazione basata sulla distanza calcolata
    if (distance < 0) {
      return '#999999'; // Grigio - Valore non valido
    } else if (distance < 1) {
      return '#4CAF50'; // Verde - Molto vicino (< 1m)
    } else if (distance < 3) {
      return '#FFC107'; // Giallo - Distanza media (1-3m)
    } else if (distance < 10) {
      return '#FF9800'; // Arancione - Lontano (3-10m)
    } else {
      return '#F44336'; // Rosso - Molto lontano (> 10m)
    }
  };

  const getDistanceText = (rssi: number) => {
    const distance = calculateDistance(rssi);
    
    if (distance < 0) {
      return 'Unknown';
    } else if (distance < 1) {
      return 'Molto Vicino';
    } else if (distance < 3) {
      return 'Vicino';
    } else if (distance < 10) {
      return 'Lontano';
    } else {
      return 'Molto Lontano';
    }
  };

  // Componente Beacon Card con animazione
  const BeaconCard = ({ item, isClosest }: { item: Beacon; isClosest: boolean }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      if (isClosest) {
        // Animazione lampeggiante per il beacon più vicino
        const pulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.3,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        );
        pulse.start();

        return () => pulse.stop();
      } else {
        pulseAnim.setValue(1);
      }
    }, [isClosest, pulseAnim]);

    return (
      <View style={[
        styles.beaconCard,
        isClosest && styles.closestBeaconCard
      ]}>
        {isClosest && (
          <View style={styles.closestBadge}>
            <Text style={styles.closestBadgeText}>📍 PIÙ VICINO</Text>
          </View>
        )}
        
        <View style={styles.beaconHeader}>
          <Animated.View 
            style={[
              styles.statusIndicator, 
              { 
                backgroundColor: getDistanceColor(item.rssi),
                transform: [{ scale: pulseAnim }]
              }
            ]} 
          />
          <Text style={styles.distanceText}>
            {getDistanceText(item.rssi)}
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
              <Text style={styles.label}>Distanza</Text>
              <Text style={styles.metricValue}>
                {calculateDistance(item.rssi) >= 0 
                  ? `${calculateDistance(item.rssi).toFixed(2)}m` 
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderBeacon = ({ item, index }: { item: Beacon; index: number }) => (
    <BeaconCard item={item} isClosest={index === 0 && beacons.length > 0} />
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
  closestBeaconCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  closestBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  closestBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
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
