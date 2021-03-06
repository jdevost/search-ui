import { FacetValueState } from './FacetValueState';

/**
 * A [values]{@link IFacetRequest.values} item in a Search API [facet response]{@link IFacetRequest}.
 */
export interface IFacetResponseValue {
  /**
   * The facet value name.
   */
  value: string;

  /**
   * The facet value state to display in the search interface.
   */
  state: FacetValueState;

  /**
   * The number of query result items matching the facet value.
   */
  numberOfResults: number;
}

/**
 * An item in the response of a Search API [facet request]{@link IFacetRequest}.
 */
export interface IFacetResponse {
  /**
   * The unique facet identifier in the search interface.
   */
  facetId: string;

  /**
   * The name of the field on which the facet is based.
   */
  field: string;

  /**
   * Whether additional values are available for the facet.
   */
  moreValuesAvailable: boolean;

  /**
   * The returned facet values.
   *
   * See [IFacetResponseValue]{@link IFacetResponseValue}
   */
  values: IFacetResponseValue[];
}
