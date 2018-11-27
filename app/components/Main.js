import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Alert} from 'react-native';

import Note from './Note';
const Realm = require('realm');
//import Firebase from 'firebase';

export default class Main extends Component {

  constructor(props){
    super(props);
    this.state = {
      realm: null,
      noteText: '',
      idMax: 1
    }
  }

  componentWillMount() {
    //Firebase
    /*var config = {
      apiKey: "AIzaSyAxU4wWL5OJLo8nqOsCoCs1b9QaQt6bqCk",
      authDomain: "todomobile-68b4b.firebaseapp.com",
      databaseURL: "https://todomobile-68b4b.firebaseio.com",
      projectId: "todomobile-68b4b",
      storageBucket: "todomobile-68b4b.appspot.com",
      messagingSenderId: "759413461210"
    };
    firebase.initializeApp(config);*/
    //Realm
    let date = Date();
    let proxId = this.state.idMax;
    Realm.open({
      schema: [{name: 'List', primaryKey:'id', properties: {id: 'int', note: 'string', date: 'date'}}]
    }).then(realm => {
      if(realm.objects('List').length<1){
        realm.write(() => {
          realm.create('List', {id: this.state.idMax, note: 'Test', date: date});
        });
      }
      let arrayOrdened = realm.objects('List').sorted('id', false);
      proxId = arrayOrdened[0].id;
      this.setState({ idMax: proxId });
      this.setState({ realm });
      //Populando Firebase
      /*for(let i=0; i<realm.objects('List').length;i++){
        firebase.database().ref('itens/'+realm.objects('List')[i].id).set({
          id: realm.objects('List')[i].id,
          note: realm.objects('List')[i].note,
          date: realm.objects('List')[i].date
        })
      };*/

    });
  }

  render() {

    let notes = {};
    if (this.state.realm){
      notes = this.state.realm.objects('List').map((val) =>{
        return <Note key={val.id} keyval={val.id} val={val} noteText={this.state.noteText}
                /*renameMethod={() => this.renameNote.bind(this)}*/
                deleteMethod={() => this.deleteNote(val.id)} />
      })
    } else {
      notes = <Text>Loading ...</Text>;
    }

    return (
      <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>- Agenda -</Text>
          </View>
          <ScrollView style={styles.scrollContainer}>
            {notes}      
          </ScrollView>
          <View style={styles.footer}>
            <TextInput 
              style={styles.textInput}
              onChangeText={(noteText) => this.setState({noteText})}
              value={this.state.noteText}
              placeholder='Escreva aki o que deseja adicionar!'
              placeholderTextColor='white'
              underlineColorAndroid='transparent'>
            </TextInput>
          </View>
          <TouchableOpacity onPress={this.addNote.bind(this)} style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
      </View>
    );
  }

  addNote() {
    if (this.state.noteText){
      var date = new Date();
      let proxId = this.state.idMax + 1;
      var realm = this.state.realm;
      let notes = this.state.realm.objects('List');
      let existId = true;
      while(existId){
        let noteAdd = notes.filtered('id=' + proxId + '')
        if(noteAdd.length<1){
          existId=false;
          try{
            realm.write(() => {
              realm.create('List', {id: proxId, note: this.state.noteText, date: date});
            });
            this.setState({idMax: proxId })
            this.setState({ realm });
            this.setState({noteText:''});
          } 
          catch (error) {
            alert(error);
          }
        }else{
          proxId = proxId + 1;
        }
      }
    }
    else{
      alert('Coloque algum texto!')
    }
  }

  /*renameNote(key, note){
    var realm = this.state.realm;
    try{
      realm.write(() => {
        realm.create('List', {id: key, note: note}, true);
      });
      this.setState({ realm });
      } 
    catch (error) {
      alert(error);
    }
  }*/

  deleteNote(key){
    Alert.alert('Delete', 'Quer realmente apagar esse item?', [ 
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'OK', onPress: () => {
          let notes = this.state.realm.objects('List');
          let noteDeleting = notes.filtered('id=' + key + '')
          var realm = this.state.realm;
          try{
            realm.write(() => {
              realm.delete(noteDeleting);
            });
            this.setState({ realm });
          } 
          catch (error) {
            alert(error);
          }
        }
      }
      ], [{ cancelable: false }]);
  }
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
  },
  header: {
      backgroundColor: '#4d4dff',
      alignItems: 'center',
      justifyContent:'center',
      borderBottomWidth: 10,
      borderBottomColor: '#ddd'
  },
  headerText: {
      color: 'white',
      fontSize: 18,
      padding: 26
  },
  scrollContainer: {
      flex: 1,
      marginBottom: 100
  },
  footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10
  },
  textInput: {
      alignSelf: 'stretch',
      color: '#fff',
      padding: 20,
      backgroundColor: '#252525',
      borderTopWidth:2,
      borderTopColor: '#ededed'
  },
  addButton: {
    position: 'absolute',
    zIndex: 11,
    right: 20,
    bottom: 30,
    backgroundColor: '#4d4dff',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24
  }
});
