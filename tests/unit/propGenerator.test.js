import { describe, it, expect } from 'vitest';
import { detectPropNamesFromCode, generatePropsForComponent } from '../../src/lib/propGenerator';

describe('propGenerator', () => {
  it('detects prop names from destructured params and props access', () => {
    const code = `
      export default function Button({ size = 'md', variant, icon, isDisabled }) {
        return (
          <button className={props.className} data-size={size} disabled={isDisabled}>
            {icon ? <Icon name={icon} /> : null}
            {props['label']}
            {variant}
          </button>
        );
      }
    `;

    const names = detectPropNamesFromCode(code);
    // order isn't critical; just ensure key names are present
    expect(names).toEqual(expect.arrayContaining(['size', 'variant', 'icon', 'isDisabled', 'label']));
  });

  it('generates template props for button category and merges inferred without overwriting', () => {
    const existingProps = [
      // user customized: variant options
      { name: 'variant', type: 'enum', default: 'primary', required: false, description: 'Custom', options: ['solid', 'outline'] },
    ];

    const code = `
      export default function Button({ size, variant, iconPosition }) {
        return <button data-size={size} data-variant={variant}>{iconPosition}</button>;
      }
    `;

    const { props, report } = generatePropsForComponent({
      category: 'buttons',
      code,
      existingProps,
    });

    // should keep user's customized variant options
    const variant = props.find(p => p.name === 'variant');
    expect(variant.options).toEqual(['solid', 'outline']);

    // should add iconPosition inferred (enum) if missing
    const iconPosition = props.find(p => p.name === 'iconPosition');
    expect(iconPosition).toBeTruthy();

    // should add baseline template props
    expect(props.map(p => p.name)).toEqual(expect.arrayContaining(['children', 'className']));

    expect(report.addedCount).toBeGreaterThan(0);
  });
});


