import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Deal } from '../types';
import { fetchDeals } from '../services/api';
import { DealCard } from '../components/DealCard';
import { SearchIcon, FilterIcon, GamepadIcon } from '../components/Icons';
import { colors, spacing, radius, typography } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

const SORT_OPTIONS = [
  { label: 'Melhores', value: 'DealRating' },
  { label: 'Desconto', value: 'Savings' },
  { label: 'Preço', value: 'Price' },
  { label: 'Metacritic', value: 'Metacritic' },
  { label: 'Recentes', value: 'Recent' },
];

export default function DealsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('DealRating');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const loadDeals = useCallback(async (pageNum = 0, sortBy = selectedSort, query = searchQuery, reset = false) => {
    try {
      if (pageNum === 0) setLoading(true); else setLoadingMore(true);
      setError(null);
      const data = await fetchDeals({ pageNumber: pageNum, pageSize: 20, sortBy, title: query || undefined });
      if (reset || pageNum === 0) setDeals(data); else setDeals(prev => [...prev, ...data]);
      setHasMore(data.length === 20);
      setPage(pageNum);
    } catch {
      setError('Não foi possível carregar os deals. Verifique sua conexão.');
    } finally {
      setLoading(false); setLoadingMore(false); setRefreshing(false);
    }
  }, [selectedSort, searchQuery]);

  useEffect(() => { loadDeals(0, selectedSort, searchQuery, true); }, [selectedSort]);

  const handleRefresh = () => { setRefreshing(true); loadDeals(0, selectedSort, searchQuery, true); };
  const handleLoadMore = () => { if (!loadingMore && hasMore && !loading) loadDeals(page + 1); };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Carregando deals...</Text>
      </View>
    );
  }

  if (error && deals.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadDeals(0, selectedSort, searchQuery, true)}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <View style={styles.navBrand}>
          <GamepadIcon size={20} color={colors.accent} />
          <Text style={styles.navTitle}>GameDeals</Text>
        </View>
      </View>

      <FlatList
        data={deals}
        keyExtractor={item => item.dealID}
        renderItem={({ item }) => (
          <DealCard deal={item} onPress={() => navigation.navigate('DealDetail', { dealID: item.dealID, title: item.title })} />
        )}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <SearchIcon size={16} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar deals..."
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={() => loadDeals(0, selectedSort, searchQuery, true)}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setSearchQuery(''); loadDeals(0, selectedSort, '', true); }}>
                    <Text style={styles.clearBtn}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
                onPress={() => setShowFilters(!showFilters)}
              >
                <FilterIcon size={18} color={showFilters ? colors.bg0 : colors.accent} />
              </TouchableOpacity>
            </View>
            {showFilters && (
              <View style={styles.sortRow}>
                {SORT_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.sortChip, selectedSort === opt.value && styles.sortChipActive]}
                    onPress={() => setSelectedSort(opt.value)}
                  >
                    <Text style={[styles.sortChipText, selectedSort === opt.value && styles.sortChipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Deals</Text>
              <Text style={styles.sectionCount}>{deals.length} resultados</Text>
            </View>
          </View>
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 16 }} color={colors.accent} /> : null}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <GamepadIcon size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhum deal encontrado</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg1 },
  centered: { flex: 1, backgroundColor: colors.bg1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  loadingText: { color: colors.textSecondary, fontSize: typography.sm, marginTop: spacing.sm },
  errorText: { color: colors.textSecondary, fontSize: typography.sm, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.md, marginTop: spacing.sm },
  retryText: { color: colors.bg0, fontWeight: '700', fontSize: typography.sm },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: spacing.md, backgroundColor: colors.bg0, borderBottomWidth: 1, borderBottomColor: colors.border },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  navTitle: { color: colors.textPrimary, fontSize: typography.lg, fontWeight: '700' },
  listHeader: { paddingTop: spacing.lg, paddingBottom: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.sm },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg2, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, height: 42, gap: spacing.sm },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: typography.sm, padding: 0 },
  clearBtn: { color: colors.textMuted, fontSize: 20, lineHeight: 20 },
  filterBtn: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.accentDim, alignItems: 'center', justifyContent: 'center' },
  filterBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  sortChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border },
  sortChipActive: { backgroundColor: colors.accentMuted, borderColor: colors.accent },
  sortChipText: { color: colors.textSecondary, fontSize: typography.sm, fontWeight: '500' },
  sortChipTextActive: { color: colors.accent },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.base, fontWeight: '600' },
  sectionCount: { color: colors.textMuted, fontSize: typography.xs },
  emptyState: { alignItems: 'center', paddingVertical: 80, gap: spacing.md },
  emptyTitle: { color: colors.textSecondary, fontSize: typography.md, fontWeight: '600' },
});
