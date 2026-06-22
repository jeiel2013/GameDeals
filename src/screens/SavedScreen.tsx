import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { SavedDeal } from '../types';
import { getAllSavedDeals, removeSavedDeal } from '../services/database';
import { formatPrice } from '../services/api';
import { colors, spacing, radius, typography } from '../theme';
import { TrashIcon, BookmarkIcon, TagIcon } from '../components/Icons';

export default function SavedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [saved, setSaved] = useState<SavedDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    (async () => { setLoading(true); setSaved(await getAllSavedDeals()); setLoading(false); })();
  }, []));

  const handleRemove = (deal: SavedDeal) => {
    Alert.alert('Remover deal', `Remover "${deal.title}" dos seus deals salvos?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        await removeSavedDeal(deal.dealID);
        setSaved(prev => prev.filter(d => d.dealID !== deal.dealID));
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>Deals Salvos</Text>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.accent} /></View>
      ) : saved.length === 0 ? (
        <View style={styles.centered}>
          <BookmarkIcon size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhum deal salvo</Text>
          <Text style={styles.emptySubtitle}>Navegue pelos deals e toque em "Salvar na Biblioteca"</Text>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={item => item.id.toString()}
          ListHeaderComponent={
            <Text style={styles.count}>{saved.length} deal{saved.length !== 1 ? 's' : ''} salvo{saved.length !== 1 ? 's' : ''}</Text>
          }
          renderItem={({ item }) => {
            const savings = Math.round(parseFloat(item.savings));
            const isFree = parseFloat(item.salePrice) === 0;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('DealDetail', { dealID: item.dealID, title: item.title })}
                activeOpacity={0.75}
              >
                <Image source={{ uri: item.thumb }} style={styles.thumb} resizeMode="cover" />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.salePrice, isFree && { color: colors.green }]}>
                      {isFree ? 'Grátis' : formatPrice(item.salePrice)}
                    </Text>
                    {!isFree && savings > 0 && (
                      <View style={styles.savingsBadge}>
                        <TagIcon size={9} color={colors.bg0} />
                        <Text style={styles.savingsText}>{savings}%</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.savedDate}>Salvo em {new Date(item.savedAt).toLocaleDateString('pt-BR')}</Text>
                </View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <TrashIcon size={16} color={colors.red} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
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
  navbar: { paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: spacing.md, backgroundColor: colors.bg0, borderBottomWidth: 1, borderBottomColor: colors.border },
  navTitle: { color: colors.textPrimary, fontSize: typography.lg, fontWeight: '700' },
  count: { color: colors.textMuted, fontSize: typography.xs, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  card: { flexDirection: 'row', backgroundColor: colors.bg2, marginHorizontal: spacing.lg, marginBottom: spacing.md, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  thumb: { width: 90, height: 68 },
  cardContent: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.xs },
  cardTitle: { color: colors.textPrimary, fontSize: typography.sm, fontWeight: '600', lineHeight: typography.sm * 1.3 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  salePrice: { color: colors.accent, fontSize: typography.base, fontWeight: '700' },
  savingsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.green, paddingHorizontal: 5, paddingVertical: 2, borderRadius: radius.full, gap: 2 },
  savingsText: { color: colors.bg0, fontSize: 10, fontWeight: '700' },
  savedDate: { color: colors.textMuted, fontSize: 11 },
  removeBtn: { padding: spacing.lg },
  emptyTitle: { color: colors.textSecondary, fontSize: typography.lg, fontWeight: '600' },
  emptySubtitle: { color: colors.textMuted, fontSize: typography.sm, textAlign: 'center', lineHeight: typography.sm * 1.5 },
});
