export interface DesignSystem {
  name: string;
  version: string;
  generatedAt: string;
  themes: Theme[];
  tokens: Token[];
  components: Component[];
}

export interface Theme {
  name: string;
  slug: string;
  isDefault: boolean;
}

export interface Token {
  themeId: string;
  themeName: string;
  path: string;
  name: string;
  category: string;
  type: string;
  value: any;
  css_variable: string;
}

export interface Component {
  name: string;
  slug: string;
  description: string;
  category: string;
  props: Prop[];
  variants: Variant[];
  code: string;
  linked_tokens: string[];
  examples: Example[];
}

export interface Prop {
  name: string;
  type: string;
  default?: any;
  required: boolean;
  description: string;
}

export interface Variant {
  name: string;
  props: Record<string, any>;
  description: string;
}

export interface Example {
  title: string;
  code: string;
  description: string;
}

