import { getConfiguratorSettings } from '@/lib/site-settings';
import { ConfigsEditor } from '@/components/admin/ConfigsEditor';

export const dynamic = 'force-dynamic';

export default async function AdminConfigsPage() {
  const configurator = await getConfiguratorSettings();

  return (
    <div className="p-4 md:p-8">
      <h1 className="font-display text-2xl font-extrabold md:text-3xl">Configs</h1>
      <p className="mt-1 text-sm text-ink-muted dark:text-gray-400">
        Storefront display settings. These apply across the whole site.
      </p>
      <ConfigsEditor initial={configurator} />
    </div>
  );
}
