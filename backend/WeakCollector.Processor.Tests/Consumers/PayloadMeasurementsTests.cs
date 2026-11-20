using WeakCollector.Data;
using WeakCollector.Processor.Consumers;
using WeakCollector.Processor.Tests.Support;

namespace WeakCollector.Processor.Tests.Consumers;

public class PayloadMeasurementsTests
{
    [Fact]
    public void Read_maps_each_field_to_a_measurement_with_its_value_type()
    {
        var measurements = PayloadMeasurements.Read(SamplePolls.Payload("""{"co2":630,"energy":819.12,"motionDetected":true,"status":"ok"}"""));

        measurements.Select(m => (m.Name, m.Value, m.ValueType)).ShouldBe(
        [
            ("co2", "630", MeasurementValueType.Number),
            ("energy", "819.12", MeasurementValueType.Number),
            ("motionDetected", "true", MeasurementValueType.Boolean),
            ("status", "ok", MeasurementValueType.Text),
        ]);
    }

    [Theory]
    [InlineData("""{"x":null}""", "null")]
    [InlineData("""{"x":{"a":1}}""", """{"a":1}""")]
    [InlineData("""{"x":[1,2]}""", "[1,2]")]
    public void Read_stores_null_objects_and_arrays_as_raw_json_text(string payload, string expected)
    {
        var measurement = PayloadMeasurements.Read(SamplePolls.Payload(payload)).ShouldHaveSingleItem();

        measurement.Value.ShouldBe(expected);
        measurement.ValueType.ShouldBe(MeasurementValueType.Text);
    }

    [Theory]
    [InlineData("[]")]
    [InlineData("330")]
    [InlineData("null")]
    public void Read_returns_nothing_when_the_payload_is_not_an_object(string payload)
    {
        PayloadMeasurements.Read(SamplePolls.Payload(payload)).ShouldBeEmpty();
    }
}
