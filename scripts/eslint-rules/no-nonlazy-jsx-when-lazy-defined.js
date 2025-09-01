/**
 * ESLint rule: no-nonlazy-jsx-when-lazy-defined
 * Flags usage of <Component ...> JSX when the same file defines `const ComponentLazy = lazy(...)`.
 */

export default {
  rules: {
    'no-nonlazy-jsx-when-lazy-defined': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow rendering non-lazy JSX when a Lazy variant is defined in the same file',
        },
        schema: [],
        messages: {
          useLazy: 'Use <{{lazyName}} ...> (wrapped in <Suspense>) instead of <{{name}} ...> because {{lazyName}} is defined in this file.',
        },
      },
      create(context) {
        const lazyMap = new Map(); // baseName -> lazyVarName

        return {
          VariableDeclarator(node) {
            try {
              if (!node.id || !node.init) return;
              if (node.id.type !== 'Identifier') return;
              const varName = node.id.name;
              if (!varName.endsWith('Lazy')) return;
              if (node.init.type !== 'CallExpression') return;
              if (node.init.callee.type !== 'Identifier' || node.init.callee.name !== 'lazy') return;
              const base = varName.slice(0, -4);
              if (base) lazyMap.set(base, varName);
            } catch {}
          },
          JSXOpeningElement(node) {
            try {
              const nameNode = node.name;
              if (nameNode.type === 'JSXIdentifier') {
                const name = nameNode.name;
                const lazyName = lazyMap.get(name);
                if (lazyName) {
                  context.report({
                    node: nameNode,
                    messageId: 'useLazy',
                    data: { name, lazyName },
                  });
                }
              }
            } catch {}
          },
        };
      },
    },
  },
};
