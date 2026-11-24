import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export enum AggregateFunction {
  Avg = 'AVG',
  Max = 'MAX',
  Min = 'MIN'
}

export type DateTimeOperationFilterInput = {
  eq?: string | null | undefined;
  gt?: string | null | undefined;
  gte?: string | null | undefined;
  in?: Array<string | null | undefined> | null | undefined;
  lt?: string | null | undefined;
  lte?: string | null | undefined;
  neq?: string | null | undefined;
  ngt?: string | null | undefined;
  ngte?: string | null | undefined;
  nin?: Array<string | null | undefined> | null | undefined;
  nlt?: string | null | undefined;
  nlte?: string | null | undefined;
};

export type ListFilterInputTypeOfMeasurementFilterInput = {
  all?: MeasurementFilterInput | null | undefined;
  any?: boolean | null | undefined;
  none?: MeasurementFilterInput | null | undefined;
  some?: MeasurementFilterInput | null | undefined;
};

export type LongOperationFilterInput = {
  eq?: number | null | undefined;
  gt?: number | null | undefined;
  gte?: number | null | undefined;
  in?: Array<number | null | undefined> | null | undefined;
  lt?: number | null | undefined;
  lte?: number | null | undefined;
  neq?: number | null | undefined;
  ngt?: number | null | undefined;
  ngte?: number | null | undefined;
  nin?: Array<number | null | undefined> | null | undefined;
  nlt?: number | null | undefined;
  nlte?: number | null | undefined;
};

export type MeasurementFilterInput = {
  and?: Array<MeasurementFilterInput> | null | undefined;
  id?: LongOperationFilterInput | null | undefined;
  meterReading?: MeterReadingFilterInput | null | undefined;
  meterReadingId?: LongOperationFilterInput | null | undefined;
  name?: StringOperationFilterInput | null | undefined;
  or?: Array<MeasurementFilterInput> | null | undefined;
  value?: StringOperationFilterInput | null | undefined;
  valueType?: MeasurementValueTypeOperationFilterInput | null | undefined;
};

export enum MeasurementValueType {
  Boolean = 'BOOLEAN',
  Number = 'NUMBER',
  Text = 'TEXT'
}

export type MeasurementValueTypeOperationFilterInput = {
  eq?: MeasurementValueType | null | undefined;
  in?: Array<MeasurementValueType> | null | undefined;
  neq?: MeasurementValueType | null | undefined;
  nin?: Array<MeasurementValueType> | null | undefined;
};

export type MeterReadingFilterInput = {
  and?: Array<MeterReadingFilterInput> | null | undefined;
  id?: LongOperationFilterInput | null | undefined;
  location?: StringOperationFilterInput | null | undefined;
  measurements?: ListFilterInputTypeOfMeasurementFilterInput | null | undefined;
  or?: Array<MeterReadingFilterInput> | null | undefined;
  pollId?: UuidOperationFilterInput | null | undefined;
  polledAt?: DateTimeOperationFilterInput | null | undefined;
  type?: StringOperationFilterInput | null | undefined;
};

export type MeterReadingSortInput = {
  id?: SortEnumType | null | undefined;
  location?: SortEnumType | null | undefined;
  pollId?: SortEnumType | null | undefined;
  polledAt?: SortEnumType | null | undefined;
  type?: SortEnumType | null | undefined;
};

export enum SortEnumType {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type StringOperationFilterInput = {
  and?: Array<StringOperationFilterInput> | null | undefined;
  contains?: string | null | undefined;
  endsWith?: string | null | undefined;
  eq?: string | null | undefined;
  in?: Array<string | null | undefined> | null | undefined;
  ncontains?: string | null | undefined;
  nendsWith?: string | null | undefined;
  neq?: string | null | undefined;
  nin?: Array<string | null | undefined> | null | undefined;
  nstartsWith?: string | null | undefined;
  or?: Array<StringOperationFilterInput> | null | undefined;
  startsWith?: string | null | undefined;
};

export enum TimeRange {
  LastDay = 'LAST_DAY',
  LastHour = 'LAST_HOUR',
  LastMonth = 'LAST_MONTH',
  LastWeek = 'LAST_WEEK'
}

export type UuidOperationFilterInput = {
  eq?: string | null | undefined;
  gt?: string | null | undefined;
  gte?: string | null | undefined;
  in?: Array<string | null | undefined> | null | undefined;
  lt?: string | null | undefined;
  lte?: string | null | undefined;
  neq?: string | null | undefined;
  ngt?: string | null | undefined;
  ngte?: string | null | undefined;
  nin?: Array<string | null | undefined> | null | undefined;
  nlt?: string | null | undefined;
  nlte?: string | null | undefined;
};

export type LatestReadingsQueryVariables = Exact<{ [key: string]: never; }>;


export type LatestReadingsQuery = { latestMeterReadings: Array<{ id: number, location: string, polledAt: string, type: string, measurements: Array<{ id: number, name: string, value: string, valueType: MeasurementValueType }> }> };

export type ReadingsQueryVariables = Exact<{
  where?: MeterReadingFilterInput | null | undefined;
  order?: Array<MeterReadingSortInput> | MeterReadingSortInput | null | undefined;
  first?: number | null | undefined;
  after?: string | null | undefined;
  last?: number | null | undefined;
  before?: string | null | undefined;
}>;


export type ReadingsQuery = { allReadings: { totalCount: number, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null }, nodes: Array<{ id: number, location: string, polledAt: string, type: string, measurements: Array<{ id: number, name: string, value: string, valueType: MeasurementValueType }> }> | null } | null };

export type MetricsQueryVariables = Exact<{
  range: TimeRange;
}>;


export type MetricsQuery = { metrics: Array<{ type: string, name: string, valueType: MeasurementValueType }> };

export type AggregationQueryVariables = Exact<{
  type: string;
  name: string;
  range: TimeRange;
  aggregate: AggregateFunction;
}>;


export type AggregationQuery = { aggregation: Array<{ location: string, value: number }> };

export type MeasurementTrendQueryVariables = Exact<{
  type: string;
  name: string;
  range: TimeRange;
  aggregate: AggregateFunction;
}>;


export type MeasurementTrendQuery = { measurementTrend: Array<{ location: string, polledAt: string, value: number }> };


export const LatestReadingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LatestReadings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"latestMeterReadings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"polledAt"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"measurements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}}]}}]}}]}}]} as unknown as DocumentNode<LatestReadingsQuery, LatestReadingsQueryVariables>;
export const ReadingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Readings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"where"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MeterReadingFilterInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"order"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MeterReadingSortInput"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"last"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"before"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allReadings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"Variable","name":{"kind":"Name","value":"where"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"Variable","name":{"kind":"Name","value":"order"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"Variable","name":{"kind":"Name","value":"last"}}},{"kind":"Argument","name":{"kind":"Name","value":"before"},"value":{"kind":"Variable","name":{"kind":"Name","value":"before"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"polledAt"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"measurements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ReadingsQuery, ReadingsQueryVariables>;
export const MetricsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Metrics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"range"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TimeRange"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metrics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"range"},"value":{"kind":"Variable","name":{"kind":"Name","value":"range"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}}]}}]}}]} as unknown as DocumentNode<MetricsQuery, MetricsQueryVariables>;
export const AggregationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Aggregation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"range"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TimeRange"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"aggregate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AggregateFunction"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aggregation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"range"},"value":{"kind":"Variable","name":{"kind":"Name","value":"range"}}},{"kind":"Argument","name":{"kind":"Name","value":"aggregate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"aggregate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]} as unknown as DocumentNode<AggregationQuery, AggregationQueryVariables>;
export const MeasurementTrendDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MeasurementTrend"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"range"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TimeRange"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"aggregate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AggregateFunction"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"measurementTrend"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"range"},"value":{"kind":"Variable","name":{"kind":"Name","value":"range"}}},{"kind":"Argument","name":{"kind":"Name","value":"aggregate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"aggregate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"polledAt"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]} as unknown as DocumentNode<MeasurementTrendQuery, MeasurementTrendQueryVariables>;