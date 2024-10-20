module.exports = {
    'env': {
        'react-native/react-native': true,
        'es2021': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript'
        // "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'tsconfigRootDir': __dirname,
        'project': ['./tsconfig.json'],
        'ecmaFeatures': {
            'jsx': true
        },
        'ecmaVersion': 12,
        'sourceType': 'module'
    },
    'settings': {
        'react': {
            'version': 'detect'
        },
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx']
        },
        'import/resolver': {
            'typescript': {
                'alwaysTryTypes': true
            }
        }
    },
    'plugins': [
        'react',
        'react-native',
        '@typescript-eslint',
        'import',
        'jsx-conditionals'
    ],
    'rules': {
        '@typescript-eslint/no-unused-vars': [
            'error'
        ],
        'jsx-conditionals/ensure-booleans': 'warn',
        'no-multi-spaces': ['error',
            {
            ignoreEOLComments: true 
            }
        ], 
        '@typescript-eslint/member-delimiter-style': [
            'error',
            {
                'multiline': {
                    'delimiter': 'none',
                    'requireLast': false
                },
                'singleline': {
                    'delimiter': 'semi',
                    'requireLast': false
                },
                'multilineDetection': 'brackets'
            }
        ],
        'eol-last': [
            'error',
            'always'
        ],
        'no-floating-decimal': [
            'error'
        ],
        'no-unused-vars': 'off',
        'object-curly-spacing': [
            'error',
            'always',
            { 'arraysInObjects': false, 'objectsInObjects': false }
        ],
        'quotes': [
            'error',
            'single'
        ],
        'space-before-blocks': [
            'error'
        ],
        'space-infix-ops': [
            'error'
        ],
        'space-in-parens': [
            'error',
            'never'
        ],
        'keyword-spacing': [
            'error'
        ],
        'no-negated-condition': [
            'error'
        ],
        'no-unneeded-ternary': [
            'error'
        ],
        'react/destructuring-assignment': [
            'error',
            'always'
        ],
        'react/no-typos': [
            'error'
        ],
        'react/boolean-prop-naming': [
            'error',
            {
                'propTypeNames': [
                    'bool',
                    'mutuallyExclusiveTrueProps'
                ],
                'rule': '^(is|has|should)[A-Z]([A-Za-z0-9]?)+'
            }
        ],
        'react/jsx-curly-spacing': [
            2,
            {
                'when': 'never',
                'allowMultiline': true,
                'children': true
            }
        ],
        'react/jsx-closing-bracket-location': [
            'error',
            'line-aligned'
        ],
        'react/jsx-indent': [
            'error',
            2
        ],
        'react/jsx-max-props-per-line': [
            'error',
            { 'maximum': {
                'single': 2,
                'multi': 1
            }}
        ],
        'react/jsx-indent-props': [
            'error',
            2
        ],
        'react/button-has-type': [
            'error'
        ],
        'react/function-component-definition': [
            2,
            {
                'namedComponents': 'arrow-function'
            }
        ],
        'react/jsx-no-useless-fragment': [
            2
        ],
        'react/jsx-pascal-case': [
            2
        ],
        'react/jsx-tag-spacing': [
            2,
            {
                'beforeClosing': 'never'
            }
        ],
        '@typescript-eslint/await-thenable': [
            2
        ],
        '@typescript-eslint/consistent-type-exports': [
            2
        ],
        '@typescript-eslint/no-base-to-string': [
            2
        ],
        'import/named': [
            2
        ],
        'import/no-unresolved': [
            2
        ]
    }
}
