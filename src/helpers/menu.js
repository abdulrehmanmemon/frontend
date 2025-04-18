const findItem = (menuItems, url) => {
  for (const item of menuItems) {
    if (item.url == url) {
      return item;
    }
    if (item.children) {
      const fItem = findItem(item.children, url);
      if (fItem) {
        return fItem;
      }
    }
  }
  return null;
};

const getActivatedItemParentKeys = (menuItems, url) => {
  const menuItem = findItem(menuItems, url);

  if (!menuItem) return [];
  const list = [];

  for (const item of menuItems) {
    if (item.key == menuItem.key) {
      list.push(item.key);
    }
    if (item.children) {
      for (const iItem of item.children) {
        if (iItem.key == menuItem.key) {
          list.push(item.key);
          list.push(iItem.key);
        }
        if (iItem.children != null) {
          for (const i2Item of iItem.children) {
            if (i2Item.key == menuItem.key) {
              list.push(item.key);
              list.push(iItem.key);
              list.push(i2Item.key);
            }
          }
        }
      }
    }
  }
  return list;
};

export const menuHelper = {
  getActivatedItemParentKeys,
};
