import {useSubscription} from '@apollo/react-hooks';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableHighlight,
  Text,
  View,
} from 'react-native';
import {relativeTime} from '../libs/day';

export default function Queue() {
  const [items, setItems] = useState([]);
  const {data, loading, error} = useSubscription(QUEUE_SUBSCRIPTION);

  useEffect(() => {
    if (!data) {
      if (items.length !== 0) setItems([]);
    } else if (data && data.items) {
      setItems(data.items);
    }
  }, [data]);
  return (
    <>
      {loading && <ActivityIndicator style={{marginVertical: 20}} />}
      {error && <Text>{error.message}</Text>}
      <FlatList
        data={items}
        renderItem={({item}) => (
          <Item
            {...item}
            // selected={!selected.get(item.id)}
            // onSelect={onSelect}
          />
        )}
        keyExtractor={(item) => `${item.id}`}
        ListEmptyComponent={() => (
          <Text
            style={{textAlign: 'center', paddingVertical: 20, color: '#888'}}>
            {'N/A'}
          </Text>
        )}
      />
    </>
  );
}

function Item({from, to, reserved_at, picked_up_at, dropped_off_at, driver}) {
  let intval = React.useRef(null);
  const [tm, setTm] = useState('');

  useEffect(() => {
    function timeToText(t1) {
      let tm = '';
      const now = dayjs();
      const reservedAt = dayjs(reserved_at);
      if (reservedAt > now) {
        tm = `In ${relativeTime(reserved_at)}`;
      } else if (now > reservedAt) {
        tm = `At ${reservedAt.format('HH:MM')}`;
      }
      setTm(tm);
    }
    if (intval) clearInterval(intval);
    intval = setInterval(() => {
      timeToText(reserved_at);
    }, 1000);
    return () => clearInterval(intval);
  }, [reserved_at]);

  let status = 'Wait for pickup';
  if (dropped_off_at !== null) {
    status = 'Done';
  } else if (picked_up_at !== null) {
    status = 'On SSV';
  }

  return (
    <View style={styles.Card}>
      <View style={[styles.flexColumn]}>
        <Text style={styles.locationActive}>{from}</Text>
        <Text style={styles.locationInActive}>→ {to}</Text>
      </View>
      <Text>Reservation: {tm}</Text>
      <Text>
        Status: {status}
        {driver && <Text> by {driver.username} </Text>}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  Card: {
    margin: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderWidth: 0,
    borderRadius: 5,
    borderColor: '#ddd',
    shadowColor: '#000000',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  flexRow: {
    flexDirection: 'row',
    alignContent: 'space-between',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  locationActive: {
    fontSize: 16,
    color: '#888',
  },
  locationInActive: {
    fontSize: 16,
    color: '#888',
  },
});

const QUEUE_SUBSCRIPTION = gql`
  subscription QUEUE_SUBSCRIPTION {
    items: trip(
      where: {
        _and: [
          {cancelled_at: {_is_null: true}}
          {dropped_off_at: {_is_null: true}}
        ]
      }
      order_by: {reserved_at: asc}
    ) {
      id
      from
      to
      user {
        username
      }
      reserved_at
      picked_up_at
      dropped_off_at
      cancelled_at
      driver {
        username
      }
    }
  }
`;
