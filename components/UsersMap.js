import React from 'react'
import { View, StyleSheet } from 'react-native'
import MapView from 'react-native-maps'

const usersMap = props => {
    return (
        <View style={ styles.mapContainer }>
            <MapView
                style={ styles.map }
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                region={ props.userLocation }
            ></MapView>
        </View>
    )
}

const styles = StyleSheet.create({
    mapContainer: {
        width: '100%',
        height: 300
    },
    map: {
        width: '100%',
        height: '100%'
    }
})

export default usersMap