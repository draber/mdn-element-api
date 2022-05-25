import minimist from 'minimist';

const args = minimist(process.argv.slice(2));

// 'config-env' => compat with rollup
export const env = args.env || args['config-env'] || 'dev';

export const jsonOptions = env === 'dev' ? {
    spaces: '\t'
} : {};