import { View, Text, TextInput } from "react-native"
import React from 'react';

function Input({ title, value, error, setValue, setError, secureTextEntry=false, inputStyle, containerStyle }) {
  return (
    <View style={[{ marginVertical: 10 }, containerStyle]}>
      <Text style={{ fontSize: 23, color: '#800080', marginBottom: 1 }}>{title}</Text>
      <TextInput
        value={value}
        onChangeText={text => {
          setValue(text);
          if (error) setError('');
        }}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoComplete="off"
        style={[
          {
            borderWidth: 2,
            borderColor: error ? 'red' : '#BF40BF',
            borderRadius: 10,
            fontSize: 20,
            color: 'black',
            paddingVertical: 10,
            paddingHorizontal: 10,
            backgroundColor: 'white',
			width: 300,           // full width of container (adjust container width if needed)
            height: 80,              // explicit height

          },
          inputStyle,
        ]}
      />
      {!!error && <Text style={{ color: 'red', marginTop: 5 }}>{error}</Text>}
    </View>
  );
}

export default Input;
