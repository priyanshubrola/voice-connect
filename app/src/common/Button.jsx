import React from 'react';
import { TouchableOpacity, Text } from 'react-native';


function Button({ title, onPress }) {
	return (
		<TouchableOpacity
			style={{
				backgroundColor: '#800080',
				height: 330,
				borderRadius: 15,
				alignItems: 'center',
				justifyContent: 'center',
				marginBottom: 30,
			}}
			onPress={onPress}
		>
			<Text 
				style={{ 
					color: 'white',
					fontSize: 25,
					fontWeight: 'bold'
				}}
			>
				{title}
			</Text>
		</TouchableOpacity>
	)
}

export default Button
