import React, { useState, useEffect } from 'react';
import { Text, View, Alert, Pressable, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('');
  const [barcodeData, setBarcodeData] = useState([]);

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  };

  useEffect(() => {
    askForCameraPermission();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setText(data);
    setBarcodeData(prevData => [...prevData, data]);
    console.log('Type: ' + type + '\nData: ' + data);
  };

  const handleSaveCSV = async () => {
    try {
      const content = barcodeData.join('\n');
      const fileUri = FileSystem.documentDirectory + 'barcodes.csv';
      await FileSystem.writeAsStringAsync(fileUri, content);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while saving or sharing the CSV file.');
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting for camera permission</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.marginBottom}>No access to camera</Text>
        <Pressable style={styles.buttonBlue} onPress={() => askForCameraPermission()}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.barcodeBox}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={{ height: 400, width: 400 }}
        />
      </View>
      <Text style={styles.mainText}>
        {text ? `Code = ${text}` : 'Looking for a barcode'}
      </Text>

      {scanned && (
        <Pressable
          style={styles.buttonRed}
          onPress={() => {
            setScanned(false);
            setText('');
          }}
        >
          <Text style={styles.buttonText}>Scan again?</Text>
        </Pressable>
      )}
      {barcodeData.length > 0 && (
        <>
          <Pressable style={styles.buttonBlue} onPress={handleSaveCSV}>
            <Text style={styles.buttonText}>Download CSV</Text>
          </Pressable>
          <Pressable style={styles.buttonYellow} onPress={() => setBarcodeData([])}>
            <Text style={styles.buttonText}>Restart Scanning</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainText: {
    fontSize: 16,
    margin: 20,
  },
  barcodeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: 'tomato',
  },
  marginBottom: {
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  buttonRed: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonBlue: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonYellow: {
    backgroundColor: 'orange',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,
  },
});
