const inflection = require('inflection');
const { pick } = require('@keystonejs/utils');
const { parseFieldAccess } = require('@keystonejs/access-control');
const { testFieldAccessControl } = require('@keystonejs/access-control');

class Field {
  constructor(
    path,
    config,
    {
      getListByKey,
      listKey,
      listAdapter,
      fieldAdapterClass,
      defaultAccess,
    }
  ) {
    this.path = path;
    this.config = config;
    this.getListByKey = getListByKey;
    this.listKey = listKey;
    this.label = config.label || inflection.humanize(path);
    this.adapter = listAdapter.newFieldAdapter(
      fieldAdapterClass,
      this.constructor.name,
      path,
      config
    );

    this.access = parseFieldAccess({ listKey, fieldKey: path, defaultAccess, access: config.access });
  }

  getGraphqlSchema() {
    if (!this.graphQLType) {
      throw new Error(
        `Field type [${this.constructor.name}] does not implement graphQLType`
      );
    }
    return `${this.path}: ${this.graphQLType}`;
  }

  /**
   * Auxiliary Types are top-level types which a type may need or provide.
   * Example: the `File` type, adds a graphql auxiliary type of `FileUpload`, as
   * well as an `uploadFile()` graphql auxiliary type query resolver
   *
   * These are special cases, and should be used sparingly
   *
   * NOTE: When a naming conflic occurs, a list's types/queries/mutations will
   * overwrite any auxiliary types defined by an individual type.
   */
  getGraphqlAuxiliaryTypes() {}
  getGraphqlAuxiliaryTypeResolvers() {}
  getGraphqlAuxiliaryQueries() {}
  getGraphqlAuxiliaryQueryResolvers() {}
  getGraphqlAuxiliaryMutations() {}
  getGraphqlAuxiliaryMutationResolvers() {}

  /**
   * Hooks for performing actions before / after fields are mutated.
   * For example: with a field { avatar: { type: File }}, it wants to put the
   * file on S3 in the `createFieldPreHook()`, then return asn S3 object ID as
   * the result to store in `avatar`
   *
   * @param data {Mixed} The data received from the query
   * @param item {Object} The existing version of the item
   * @param path {String} The path of the field in the item
   */
  createFieldPreHook(data) {
    return data;
  }
  /*
   * @param data {Mixed} The data as saved & read from the DB
   * @param item {Object} The existing version of the item
   * @param path {String} The path of the field in the item
   */
  createFieldPostHook() {}
  /*
   * @param data {Mixed} The data received from the query
   * @param item {Object} The existing version of the item
   * @param path {String} The path of the field in the item
   */
  updateFieldPreHook(data) {
    return data;
  }
  /*
   * @param data {Mixed} The data as saved & read from the DB
   * @param item {Object} The existing version of the item
   * @param path {String} The path of the field in the item
   */
  updateFieldPostHook() {}

  getGraphqlQueryArgs() {}
  isGraphqlQueryArg(arg) {
    return arg === this.path;
  }
  getGraphqlCreateArgs() {}
  getGraphqlUpdateArgs() {}
  getGraphqlFieldResolvers() {}
  getAdminMeta() {
    return this.extendAdminMeta({
      label: this.label,
      path: this.path,
      type: this.constructor.name,
      defaultValue: this.getDefaultValue(),
    });
  }
  extendAdminMeta(meta) {
    return meta;
  }
  getDefaultValue() {
    return this.config.defaultValue;
  }
  testAccessControl({ listKey, item, operation, authentication }) {
    return testFieldAccessControl({
      access: this.access,
      item,
      operation,
      authentication,
      fieldKey: this.path,
      listKey,
    });
  }
}

module.exports = {
  Implementation: Field,
};
