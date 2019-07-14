import React, { Component } from 'react';
import {
  ActivityIndicator,
  Button,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Constants, ImagePicker, Permissions } from 'expo';

export default class App extends Component {
  
  constructor(props){
    super(props);
    this.state={
      image:null,
      uploading:false,
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="default" />

        <Text
          style={styles.textStyle}>
          Example: Upload ImagePicker result
        </Text>

        <Button
          onPress={this._pickImage}
          title="Pick an image from camera roll"
        />
        <Button onPress={this._takePhoto} title="Take a photo" />
          {console.log(this.state.image)}
        {this._renderImage()}
        {this._renderUploadOverlay()}
      </View>
    );
  }

  _renderUploadOverlay = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[StyleSheet.absoluteFill, styles.renderUploadStyle]}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      );
    }
  };

  _renderImage = () => {
    let {
	image
    } = this.state;

    if (!image) {
      return;
    }

    return (
      <View
        style={styles.renderContainerStyle}>
        <View
          style={styles.renderImageStyle}>
          <Image source={{ uri: image }} style={styles.renderImageStyle} />
        </View>
      </View>
    );
  };


  _takePhoto = async () => {
    const {
      status: cameraPerm
    } = await Permissions.askAsync(Permissions.CAMERA);

    const {
      status: cameraRollPerm
    } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    // only if user allows permission to camera AND camera roll
    if (cameraPerm === 'granted' && cameraRollPerm === 'granted') {
      let pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });

      this._handleImagePicked(pickerResult);
    }
  };

  _pickImage = async () => {
    const {
      status: cameraRollPerm
    } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    // only if user allows permission to camera roll
    if (cameraRollPerm === 'granted') {
      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });

      this._handleImagePicked(pickerResult);
    }
  };

  _handleImagePicked = async pickerResult => {
    let uploadResponse, uploadResult;

    try {
      this.setState({
        uploading: true
      });

      if (!pickerResult.cancelled) {
        uploadResponse = await uploadImageAsync(pickerResult.uri);
        uploadResult = await uploadResponse.json();
      }
    } catch (e) {
      console.log({ uploadResponse });
      console.log({ uploadResult });
      console.log({ e });
      alert('Upload failed, sorry :(');
    } finally {
      if(!pickerResult.cancelled){
      this.setState({
        image:pickerResult.uri,
        uploading: false
      });
      alert('upload success');
	}else{
      this.setState({
        uploading: false
      });
    }
  }
  };
}

async function uploadImageAsync(uri) {
  let apiUrl = 'localhost:3000/UploadPhoto';
  
  let uriParts = uri.split('.');
  let fileType = uriParts[uriParts.length - 1];

  let formData = new FormData();
  formData.append('photo', {
    uri,
    name: `photo`,
    type: `image/jpeg`,
    
  });

  let options = {
    method: 'POST',
    body: formData,
        headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  };

  return fetch(apiUrl, options);
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  textStyle: {
    fontSize: 20,
    marginBottom: 20,
    marginHorizontal: 15,
    textAlign: 'center',
  },
  renderUploadStyle: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  renderContainerStyle: {
    borderRadius: 3,
    elevation: 2,
    marginTop: 30,
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 4,
      width: 4,
    },
    shadowRadius: 5,
    width: 250,
  },
  renderImageStyle: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    overflow: 'hidden',
  },
  renderImageStyle: {
    height: 250,
    width: 250,
  },
  renderImageStyleText: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  }
});