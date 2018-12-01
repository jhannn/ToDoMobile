import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

import Note from './Note';
const Realm = require('realm');
const axios = require('axios');

export default class Main extends Component {

  constructor(props) {
    super(props);
    this.state = {
      realm: null,
      noteText: '',
      messagesDefault: [
        'Aconteceu algum erro, tente novamente.'
      ]
    }
  }

  componentWillMount() {
    try {
      axios.get('http://10.0.0.102:3000/itens')
        .then((response) => {
          if (response.data.sucess == true) {
            Realm.open({
              schema: [{ name: 'List', primaryKey: 'id', properties: { id: 'int', note: 'string', date: 'date' } }]
            }).then(realm => {
              if (response.data.itens.length > 0) {
                realm.write(() => {
                  realm.deleteAll();
                  for (i = 0; i < response.data.itens.length; i++) {
                    realm.create('List', { id: response.data.itens[i].id, note: response.data.itens[i].note, date: response.data.itens[i].date });
                  }
                });
              }
              this.setState({ realm });
            });
          }
        }).catch(function (error) {
          alert(this.state.messagesDefault[0]);
          console.log(error);
        })
    } catch (error) {
      alert(this.state.messagesDefault[0]);
      console.log(error);
    }
  }


  render() {

    let notes = {};
    if (this.state.realm) {
      notes = this.state.realm.objects('List').map((val) => {
        return <Note key={val.id} keyval={val.id} val={val} noteText={this.state.noteText}
          deleteMethod={() => this.deleteNote(val.id)} />
      })
    } else {
      notes = <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>- Lista de Afazeres -</Text>
        </View>
        <ScrollView style={styles.scrollContainer}>
          {notes}
        </ScrollView>
        <View style={styles.footer}>
          <TextInput
            style={styles.textInput}
            onChangeText={(noteText) => this.setState({ noteText })}
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
    if (this.state.noteText) {
      var realm = this.state.realm;
      try {
        axios.post('http://10.0.0.102:3000/itens', { note: this.state.noteText })
          .then((response) => {
            if (response.data.length > 0) {
              realm.write(() => {
                realm.create('List', { id: response.data[0].id, note: response.data[0].note, date: response.data[0].date });
              });
              alert("Adicionado com sucesso!");
              this.setState({ realm });
              this.setState({ noteText: '' });
            }
            else {
              alert(this.state.messagesDefault[0]);
              console.log(response);
            }
          }).catch(function (error) {
            alert(this.state.messagesDefault[0]);
            console.log(error);
          })
      }
      catch (error) {
        alert(this.state.messagesDefault[0]);
        console.log(error);
      }
    }
    else {
      alert('Coloque algum texto!')
    }
  }

  deleteNote(key) {
    Alert.alert('Delete', 'Quer realmente apagar esse item?', [
      { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
      {
        text: 'OK', onPress: () => {
          let notes = this.state.realm.objects('List');
          let noteDeleting = notes.filtered('id=' + key + '')
          var realm = this.state.realm;
          try {
            axios.get('http://10.0.0.102:3000/itens/delete/' + key)
              .then((response) => {
                if (response.data.sucess == true) {
                  realm.write(() => {
                    realm.delete(noteDeleting);
                  });
                  alert('Item deletado com sucesso!');
                  this.setState({ realm });
                }
                else {
                  alert(this.state.messagesDefault[0]);
                  console.log(response);
                }
              })
          }
          catch (error) {
            alert(this.state.messagesDefault[0]);
            console.log(error);
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
    justifyContent: 'center',
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
    borderTopWidth: 2,
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
