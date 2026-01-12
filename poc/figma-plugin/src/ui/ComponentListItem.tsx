/**
 * @chunk 4.01 - Plugin UI - Components Tab
 * 
 * ComponentListItem - Individual component list item with checkbox
 */

interface ComponentInfo {
  id: string;
  name: string;
  type: string;
  variantCount: number;
}

interface Props {
  component: ComponentInfo;
  selected: boolean;
  onToggle: () => void;
}

export default function ComponentListItem({ component, selected, onToggle }: Props) {
  return (
    <label style={styles.listItem}>
      <input 
        type="checkbox" 
        checked={selected} 
        onChange={onToggle}
        style={styles.checkbox}
      />
      <div style={styles.itemInfo}>
        <span style={styles.name}>{component.name}</span>
        <span style={styles.meta}>
          {component.type === 'COMPONENT_SET' 
            ? `${component.variantCount} variants` 
            : 'Component'}
        </span>
      </div>
    </label>
  );
}

const styles: Record<string, React.CSSProperties> = {
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    marginBottom: '4px',
    border: '1px solid #e5e5e5',
    cursor: 'pointer',
  },
  checkbox: {
    marginRight: '10px',
    cursor: 'pointer',
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  name: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#333',
    marginBottom: '2px',
  },
  meta: {
    fontSize: '11px',
    color: '#666',
  },
};





