import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { RegleFilters, ControleWithMeta } from './types';

export function useControles(filters: RegleFilters) {
  const [controles, setControles] = useState<ControleWithMeta[]>([]);
  const [allControles, setAllControles] = useState<ControleWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('controles_reglementaires')
      .select(`
        *,
        type_controle:types_controle(*),
        batiment:batiments(nom, code, residence:residences(nom, site:sites(nom, code))),
        site:sites(nom, code)
      `)
      .order('date_prochain_controle', { ascending: true, nullsFirst: true });

    const enriched: ControleWithMeta[] = (data || []).map((c: Record<string, unknown>) => {
      const batObj = c.batiment as Record<string, unknown> | null;
      const resObj = batObj?.residence as Record<string, unknown> | null;
      const siteFromBat = resObj?.site as Record<string, unknown> | null;
      const siteDirectObj = c.site as Record<string, unknown> | null;
      return {
        ...c,
        type_controle: c.type_controle as ControleWithMeta['type_controle'],
        batiment_nom: batObj?.nom as string | undefined,
        batiment_code: batObj?.code as string | undefined,
        residence_nom: resObj?.nom as string | undefined,
        site_nom: (siteFromBat?.nom || siteDirectObj?.nom) as string | undefined,
        site_code: (siteFromBat?.code || siteDirectObj?.code) as string | undefined,
      } as ControleWithMeta;
    });

    setAllControles(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Apply filters
  useEffect(() => {
    let result = [...allControles];
    const conditions: boolean[][] = result.map(() => []);

    result.forEach((c, i) => {
      if (filters.categorieType) {
        conditions[i].push(c.type_controle?.categorie === filters.categorieType);
      }
      if (filters.siteIds.length > 0) {
        conditions[i].push(filters.siteIds.includes(c.site_id ?? ''));
      }
      if (filters.statut) {
        conditions[i].push(c.statut === filters.statut);
      }
      if (filters.echeance && c.date_prochain_controle) {
        const d = new Date(c.date_prochain_controle);
        const now = new Date();
        const endOfWeek = new Date(now); endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const endOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        if (filters.echeance === 'semaine') conditions[i].push(d <= endOfWeek && d >= now);
        else if (filters.echeance === 'mois') conditions[i].push(d <= endOfMonth && d >= now);
        else if (filters.echeance === 'trimestre') conditions[i].push(d <= endOfQuarter && d >= now);
        else if (filters.echeance === 'annee') conditions[i].push(d <= endOfYear && d >= now);
      }
    });

    const hasFilters = filters.categorieType || filters.siteIds.length > 0 || filters.statut || filters.echeance;
    if (!hasFilters) {
      setControles(result);
      return;
    }

    setControles(result.filter((_, i) => {
      const conds = conditions[i];
      if (conds.length === 0) return true;
      return filters.logicOp === 'ET' ? conds.every(Boolean) : conds.some(Boolean);
    }));
  }, [allControles, filters]);

  return { controles, allControles, loading, reload: load };
}
