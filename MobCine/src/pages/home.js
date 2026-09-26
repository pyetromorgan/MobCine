import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
} from 'react-native';


const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwOTE3MDQ2MzgxZWE4ZGE0OGMxMGE5YjFiN2M2MmI4MSIsIm5iZiI6MTc5MDAzMDk0Ny43MTQsInN1YiI6IjZhYjFiNDYzZjBlNzhjMmRmNDQ1ZjQxZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.j8SH8OMtVp6JDIlHahWS0HO1CKB6yfHv7gqLN6gCy1Q';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

export default function Home({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        searchMovies(searchQuery);
      } else {
        fetchPopularMovies();
      }
    }, 500); // aguardar 500ms apos o usuario parar de digitar

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  
  const fetchPopularMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/movie/popular?language=pt-BR&page=1`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      });
      const data = await response.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error('Erro ao buscar filmes populares:', error);
    } finally {
      setLoading(false);
    }
  };

  
  const searchMovies = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=pt-BR&page=1`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
        }
      );
      const data = await response.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error('Erro ao pesquisar filmes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

const renderMovieItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Details', { movieId: item.id })}
    >
      <Image
        source={{
          uri: item.poster_path
            ? `${IMAGE_URL}${item.poster_path}`
            : 'https://via.placeholder.com/150x225?text=Sem+Imagem',
        }}
        style={styles.poster}
      />
      <Text style={styles.movieTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.rating}>⭐ {item.vote_average?.toFixed(1)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />


      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>MobCine</Text>
        <TouchableOpacity
          style={styles.favoritesButton}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.favoritesButtonText}>❤️ Favoritos</Text>
        </TouchableOpacity>
      </View>

      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar filmes (ex: Batman)..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

    
      <Text style={styles.sectionTitle}>
        {searchQuery.trim().length > 0 ? `Resultados para "${searchQuery}"` : 'Filmes Populares'}
      </Text>

    
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum filme encontrado.</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMovieItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    paddingTop: StatusBar.currentHeight || 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E50914',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    color: '#FFF',
    height: 46,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },
  clearButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  poster: {
    width: '100%',
    height: 200,
    borderRadius: 6,
    marginBottom: 8,
  },
  movieTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  rating: {
    color: '#FFD700',
    fontSize: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  favoritesButton: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  favoritesButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});