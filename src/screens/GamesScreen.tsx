import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { fetchGames, formatPrice } from '../services/api';
import { SearchIcon, GamepadIcon, TagIcon } from '../components/Icons';
import { colors, spacing, radius, typography } from '../theme';

type Game = {
  gameID: string;
  steamAppID: string | null;
  cheapest: string;
  cheapestDealID: string;
  external: string;
  internalName: string;
  thumb: string;
};

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Games'> };

export default function GamesScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      const data = await fetchGames({ title: query.trim(), limit: 60 });
      setGames(data);
    } catch {
      setError('Não foi possível buscar os jogos. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const renderItem = ({ item }: { item: Game }) => {
    const isFree = parseFloat(item.cheapest) === 0;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DealDetail', { dealID: item.cheapestDealID, title: item.external })}
        activeOpacity={0.75}
      >
        <Image source={{ uri: item.thumb }} style={styles.thumb} resizeMode="cover" />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.external}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Melhor preço:</Text>
            <Text style={[styles.price, isFree && { color: colors.green }]}>
              {isFree ? 'Grátis' : formatPrice(item.cheapest)}
            </Text>
          </View>
        </View>
        <View style={styles.dealBtn}>
          <TagIcon size={14} color={colors.accent} />
          <Text style={styles.dealBtnText}>Ver deal</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <View style={styles.navBrand}>
          <GamepadIcon size={20} color={colors.accent} />
          <Text style={styles.navTitle}>Buscar Jogos</Text>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <SearchIcon size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Nome do jogo..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setGames([]); setSearched(false); }}>
              <Text style={styles.clearBtn}>×</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading || !query.trim()}>
          <Text style={styles.searchBtnText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Buscando jogos...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && !searched && (
        <View style={styles.centered}>
          <GamepadIcon size={56} color={colors.textMuted} />
          <Text style={styles.hintTitle}>Busque qualquer jogo</Text>
          <Text style={styles.hintText}>Digite o nome de um jogo para ver os melhores preços disponíveis nas lojas</Text>
        </View>
      )}

      {!loading && searched && games.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Nenhum jogo encontrado</Text>
          <Text style={styles.emptyText}>Tente outro termo de busca</Text>
        </View>
      )}

      {!loading && games.length > 0 && (
        <FlatList
          data={games}
          keyExtractor={item => item.gameID}
          renderItem={renderItem}
          ListHeaderComponent={
            <Text style={styles.resultCount}>{games.length} jogo{games.length !== 1 ? 's' : ''} encontrado{games.length !== 1 ? 's' : ''}</Text>
          }
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: 32 },
  navbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: spacing.md, backgroundColor: colors.bg0, borderBottomWidth: 1, borderBottomColor: colors.border },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  navTitle: { color: colors.textPrimary, fontSize: typography.lg, fontWeight: '700' },
  searchSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm, backgroundColor: colors.bg0, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg2, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, height: 44, gap: spacing.sm },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: typography.sm, padding: 0 },
  clearBtn: { color: colors.textMuted, fontSize: 20, lineHeight: 20 },
  searchBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md, height: 44, justifyContent: 'center' },
  searchBtnText: { color: colors.bg0, fontWeight: '700', fontSize: typography.sm },
  loadingText: { color: colors.textSecondary, fontSize: typography.sm, marginTop: spacing.sm },
  errorText: { color: colors.textSecondary, fontSize: typography.sm, textAlign: 'center' },
  hintTitle: { color: colors.textSecondary, fontSize: typography.md, fontWeight: '600' },
  hintText: { color: colors.textMuted, fontSize: typography.sm, textAlign: 'center', lineHeight: typography.sm * 1.6 },
  emptyTitle: { color: colors.textSecondary, fontSize: typography.md, fontWeight: '600' },
  emptyText: { color: colors.textMuted, fontSize: typography.sm },
  resultCount: { color: colors.textMuted, fontSize: typography.xs, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  card: { flexDirection: 'row', backgroundColor: colors.bg2, marginHorizontal: spacing.lg, marginBottom: spacing.md, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  thumb: { width: 90, height: 68 },
  cardContent: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.xs },
  cardTitle: { color: colors.textPrimary, fontSize: typography.sm, fontWeight: '600', lineHeight: typography.sm * 1.3 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  priceLabel: { color: colors.textMuted, fontSize: typography.xs },
  price: { color: colors.accent, fontSize: typography.base, fontWeight: '700' },
  dealBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  dealBtnText: { color: colors.accent, fontSize: typography.xs, fontWeight: '600' },
});
