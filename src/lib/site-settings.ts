import { prisma } from './prisma';

/** Display settings for the product-page configurator, editable from Admin → Configs. */
export type ConfiguratorSettings = {
  /**
   * Render tier specs as bare values ("Intel Xeon Gold 6248") instead of
   * label/value pairs ("Processor: Intel Xeon Gold 6248").
   */
  hideSpecLabels: boolean;
};

export const CONFIGURATOR_SETTINGS_KEY = 'configurator';

export const CONFIGURATOR_DEFAULTS: ConfiguratorSettings = {
  hideSpecLabels: false,
};

/** Never throws — a missing row or unreachable database falls back to defaults. */
export async function getConfiguratorSettings(): Promise<ConfiguratorSettings> {
  const row = await prisma.siteSetting
    .findUnique({ where: { key: CONFIGURATOR_SETTINGS_KEY } })
    .catch(() => null);

  const stored = (row?.value ?? {}) as Partial<ConfiguratorSettings>;
  return {
    hideSpecLabels:
      typeof stored.hideSpecLabels === 'boolean'
        ? stored.hideSpecLabels
        : CONFIGURATOR_DEFAULTS.hideSpecLabels,
  };
}
