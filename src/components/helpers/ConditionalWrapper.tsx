interface Props {
  condition: boolean
  // some kind of bug, going on here with no-unused-vars
  // eslint-disable-next-line no-unused-vars
  wrapper: (children: JSX.Element) => JSX.Element
  children: JSX.Element
}

const ConditionalWrapper = ({ condition, wrapper, children }: Props): JSX.Element => condition ? wrapper(children) : children;

export default ConditionalWrapper;
