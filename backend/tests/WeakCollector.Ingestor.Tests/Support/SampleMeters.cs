namespace WeakCollector.Ingestor.Tests.Support;

internal static class SampleMeters
{
    public const string ThreeTypes = """
        [
          {"type":"air_quality","name":"Garage","payload":{"co2":330,"pm25":22,"humidity":32}},
          {"type":"energy","name":"Bedroom","payload":{"energy":819.12}},
          {"type":"motion","name":"Kitchen","payload":{"motionDetected":true}}
        ]
        """;

    public const string WithUnknownType = """
        [
          {"type":"energy","name":"Bedroom","payload":{"energy":819.12}},
          {"type":"water","name":"Kitchen","payload":{"litres":4}}
        ]
        """;
}
