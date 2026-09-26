import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwOTE3MDQ2MzgxZWE4ZGE0OGMxMGE5YjFiN2M2MmI4MSIsIm5iZiI6MTc5MDAzMDk0Ny43MTQsInN1YiI6IjZhYjFiNDYzZjBlNzhjMmRmNDQ1ZjQxZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.j8SH8OMtVp6JDIlHahWS0HO1CKB6yfHv7gqLN6gCy1Q';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

export default function Details({ route, navigation }) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchMovieDetails();
    checkIfFavorite();
  }, [movieId]);

  // verifica se o filme já está salvo no async storage
  const checkIfFavorite = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('@favorite_movies');
      if (storedFavorites !== null) {
        const favoritesList = JSON.parse(storedFavorites);
        const exists = favoritesList.some((item) => item.id === movieId);
        setIsFavorite(exists);
      }
    } catch (error) {
      console.error('Erro ao verificar favoritos:', error);
    }
  };

 
  const toggleFavorite = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('@favorite_movies');
      let favoritesList = storedFavorites ? JSON.parse(storedFavorites) : [];

      if (isFavorite) {

        favoritesList = favoritesList.filter((item) => item.id !== movieId);
        Alert.alert('Removido', 'Filme removido dos favoritos.');
      } else {
  
        const favoriteData = {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
        };
        favoritesList.push(favoriteData);
        Alert.alert('Sucesso', 'Filme adicionado aos favoritos!');
      }

     
      await AsyncStorage.setItem('@favorite_movies', JSON.stringify(favoritesList));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Erro ao guardar favorito:', error);
    }
  };

  const fetchMovieDetails = async () => {
    try {
      const response = await fetch(`${BASE_URL}/movie/${movieId}?language=pt-BR`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      });
      const data = await response.json();
      setMovie(data);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />
      <ScrollView>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: movie?.backdrop_path || movie?.poster_path
                ? `${IMAGE_URL}${movie.backdrop_path || movie.poster_path}`
                : 'https://via.placeholder.com/500x300',
            }}
            style={styles.banner}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>

         
          <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
            <Text style={styles.favoriteButtonText}>
              {isFavorite ? '❤️ Favorito' : '🤍 Favoritar'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{movie?.title}</Text>
          <Text style={styles.overview}>{movie?.overview}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  loadingContainer: { flex: 1, backgroundColor: '#141414', justifyContent: 'center', alignItems: 'center' },
  imageContainer: { position: 'relative' },
  banner: { width: '100%', height: 240 },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backButtonText: { color: '#FFF', fontWeight: 'bold' },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  favoriteButtonText: { color: '#FFF', fontWeight: 'bold' },
  content: { padding: 16 },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  overview: { color: '#BBB', fontSize: 14, lineHeight: 20 },
});