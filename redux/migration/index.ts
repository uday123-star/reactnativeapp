import { MigrationManifest } from 'redux-persist';
import migration_0 from './0';
import migration_1 from './1';
import migration_2 from './2';
import migration_3 from './3';
import migration_4 from './4';
import migration_5 from './5';
import migration_6 from './6';
import migration_7 from './7';
import migration_8 from './8';
import migration_9 from './9';

export default {
  ...migration_0,
  ...migration_1,
  ...migration_2,
  ...migration_3,
  ...migration_4,
  ...migration_5,
  ...migration_6,
  ...migration_7,
  ...migration_8,
  ...migration_9,
} as MigrationManifest
