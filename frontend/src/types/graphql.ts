import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  Long: { input: number; output: number; }
  UUID: { input: string; output: string; }
};

export type DateTimeOperationFilterInput = {
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  neq?: InputMaybe<Scalars['DateTime']['input']>;
  ngt?: InputMaybe<Scalars['DateTime']['input']>;
  ngte?: InputMaybe<Scalars['DateTime']['input']>;
  nin?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  nlt?: InputMaybe<Scalars['DateTime']['input']>;
  nlte?: InputMaybe<Scalars['DateTime']['input']>;
};

export type ListFilterInputTypeOfMeasurementFilterInput = {
  all?: InputMaybe<MeasurementFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<MeasurementFilterInput>;
  some?: InputMaybe<MeasurementFilterInput>;
};

export type Location = {
  __typename?: 'Location';
  id: Scalars['Long']['output'];
  name: Scalars['String']['output'];
};

export type LocationFilterInput = {
  and?: InputMaybe<Array<LocationFilterInput>>;
  id?: InputMaybe<LongOperationFilterInput>;
  name?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<LocationFilterInput>>;
};

export type LocationSortInput = {
  id?: InputMaybe<SortEnumType>;
  name?: InputMaybe<SortEnumType>;
};

export type LongOperationFilterInput = {
  eq?: InputMaybe<Scalars['Long']['input']>;
  gt?: InputMaybe<Scalars['Long']['input']>;
  gte?: InputMaybe<Scalars['Long']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  lt?: InputMaybe<Scalars['Long']['input']>;
  lte?: InputMaybe<Scalars['Long']['input']>;
  neq?: InputMaybe<Scalars['Long']['input']>;
  ngt?: InputMaybe<Scalars['Long']['input']>;
  ngte?: InputMaybe<Scalars['Long']['input']>;
  nin?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  nlt?: InputMaybe<Scalars['Long']['input']>;
  nlte?: InputMaybe<Scalars['Long']['input']>;
};

export type Measurement = {
  __typename?: 'Measurement';
  id: Scalars['Long']['output'];
  meterReadingId: Scalars['Long']['output'];
  name: Scalars['String']['output'];
  value: Scalars['String']['output'];
  valueType: MeasurementValueType;
};

export type MeasurementFilterInput = {
  and?: InputMaybe<Array<MeasurementFilterInput>>;
  id?: InputMaybe<LongOperationFilterInput>;
  meterReadingId?: InputMaybe<LongOperationFilterInput>;
  name?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<MeasurementFilterInput>>;
  value?: InputMaybe<StringOperationFilterInput>;
  valueType?: InputMaybe<MeasurementValueTypeOperationFilterInput>;
};

export enum MeasurementValueType {
  Boolean = 'BOOLEAN',
  Number = 'NUMBER',
  Text = 'TEXT'
}

export type MeasurementValueTypeOperationFilterInput = {
  eq?: InputMaybe<MeasurementValueType>;
  in?: InputMaybe<Array<MeasurementValueType>>;
  neq?: InputMaybe<MeasurementValueType>;
  nin?: InputMaybe<Array<MeasurementValueType>>;
};

export type MeterReading = {
  __typename?: 'MeterReading';
  id: Scalars['Long']['output'];
  location: Location;
  locationId: Scalars['Long']['output'];
  measurements: Array<Measurement>;
  pollId: Scalars['UUID']['output'];
  polledAt: Scalars['DateTime']['output'];
  type: Scalars['String']['output'];
};

export type MeterReadingFilterInput = {
  and?: InputMaybe<Array<MeterReadingFilterInput>>;
  id?: InputMaybe<LongOperationFilterInput>;
  location?: InputMaybe<LocationFilterInput>;
  locationId?: InputMaybe<LongOperationFilterInput>;
  measurements?: InputMaybe<ListFilterInputTypeOfMeasurementFilterInput>;
  or?: InputMaybe<Array<MeterReadingFilterInput>>;
  pollId?: InputMaybe<UuidOperationFilterInput>;
  polledAt?: InputMaybe<DateTimeOperationFilterInput>;
  type?: InputMaybe<StringOperationFilterInput>;
};

export type MeterReadingSortInput = {
  id?: InputMaybe<SortEnumType>;
  location?: InputMaybe<LocationSortInput>;
  locationId?: InputMaybe<SortEnumType>;
  pollId?: InputMaybe<SortEnumType>;
  polledAt?: InputMaybe<SortEnumType>;
  type?: InputMaybe<SortEnumType>;
};

/** A connection to a list of items. */
export type MeterReadingsConnection = {
  __typename?: 'MeterReadingsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<MeterReadingsEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<MeterReading>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type MeterReadingsEdge = {
  __typename?: 'MeterReadingsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: MeterReading;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Indicates whether more edges exist following the set defined by the clients arguments. */
  hasNextPage: Scalars['Boolean']['output'];
  /** Indicates whether more edges exist prior the set defined by the clients arguments. */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  locations: Array<Location>;
  meterReadings?: Maybe<MeterReadingsConnection>;
};


export type QueryMeterReadingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<MeterReadingSortInput>>;
  where?: InputMaybe<MeterReadingFilterInput>;
};

export enum SortEnumType {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type StringOperationFilterInput = {
  and?: InputMaybe<Array<StringOperationFilterInput>>;
  contains?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  eq?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  ncontains?: InputMaybe<Scalars['String']['input']>;
  nendsWith?: InputMaybe<Scalars['String']['input']>;
  neq?: InputMaybe<Scalars['String']['input']>;
  nin?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  nstartsWith?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<StringOperationFilterInput>>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

export type UuidOperationFilterInput = {
  eq?: InputMaybe<Scalars['UUID']['input']>;
  gt?: InputMaybe<Scalars['UUID']['input']>;
  gte?: InputMaybe<Scalars['UUID']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
  lt?: InputMaybe<Scalars['UUID']['input']>;
  lte?: InputMaybe<Scalars['UUID']['input']>;
  neq?: InputMaybe<Scalars['UUID']['input']>;
  ngt?: InputMaybe<Scalars['UUID']['input']>;
  ngte?: InputMaybe<Scalars['UUID']['input']>;
  nin?: InputMaybe<Array<InputMaybe<Scalars['UUID']['input']>>>;
  nlt?: InputMaybe<Scalars['UUID']['input']>;
  nlte?: InputMaybe<Scalars['UUID']['input']>;
};

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type LocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type LocationsQuery = { locations: Array<{ id: number, name: string }> };


export const LocationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Locations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<LocationsQuery, LocationsQueryVariables>;