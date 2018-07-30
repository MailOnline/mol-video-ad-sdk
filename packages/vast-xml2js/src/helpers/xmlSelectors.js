const getChildren = ({elements = []} = {}) => elements;

const findChildByName = (element, childName) =>
  getChildren(element).find(({name = ''}) => name.toUpperCase() === childName.toUpperCase());

const filterChildrenByName = (element, childrenName) =>
  getChildren(element).filter(({name = ''}) => name.toUpperCase() === childrenName.toUpperCase());

export const get = findChildByName;

export const getAll = (element, childName) => {
  if (typeof childName === 'string') {
    return filterChildrenByName(element, childName);
  }

  return getChildren(element);
};

export const getFirstChild = (element) => getChildren(element)[0];

export const getText = (element) => {
  const firstChild = element && getFirstChild(element);

  if (firstChild) {
    return firstChild.cdata || firstChild.text || null;
  }

  return null;
};

export const getAttributes = ({attributes = {}} = {}) => attributes;

export const getAttribute = (element, attributeName) => getAttributes(element)[attributeName];
