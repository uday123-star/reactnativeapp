interface Props {
  value: string|number
  children: JSX.Element[]
}

export const Switch = ({ value, children }: Props): JSX.Element | null => {
  // filter out only children with a matching prop
  const component = children.find(child => {
    return child.props.selectionCriteria === value
  })

  return component || null;
}
