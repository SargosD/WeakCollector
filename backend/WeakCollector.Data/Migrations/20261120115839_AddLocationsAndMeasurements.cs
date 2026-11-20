using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WeakCollector.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationsAndMeasurements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_meter_readings_type_location_polled_at",
                table: "meter_readings");

            migrationBuilder.DropColumn(
                name: "location",
                table: "meter_readings");

            migrationBuilder.DropColumn(
                name: "payload",
                table: "meter_readings");

            migrationBuilder.AddColumn<long>(
                name: "location_id",
                table: "meter_readings",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateTable(
                name: "locations",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_locations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "measurements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    meter_reading_id = table.Column<long>(type: "bigint", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    value = table.Column<string>(type: "text", nullable: false),
                    value_type = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_measurements", x => x.id);
                    table.ForeignKey(
                        name: "fk_measurements_meter_readings_meter_reading_id",
                        column: x => x.meter_reading_id,
                        principalTable: "meter_readings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_meter_readings_location_id",
                table: "meter_readings",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "ix_meter_readings_type_location_id_polled_at",
                table: "meter_readings",
                columns: new[] { "type", "location_id", "polled_at" },
                descending: new[] { false, false, true });

            migrationBuilder.CreateIndex(
                name: "ix_locations_name",
                table: "locations",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_measurements_meter_reading_id",
                table: "measurements",
                column: "meter_reading_id");

            migrationBuilder.AddForeignKey(
                name: "fk_meter_readings_locations_location_id",
                table: "meter_readings",
                column: "location_id",
                principalTable: "locations",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_meter_readings_locations_location_id",
                table: "meter_readings");

            migrationBuilder.DropTable(
                name: "locations");

            migrationBuilder.DropTable(
                name: "measurements");

            migrationBuilder.DropIndex(
                name: "ix_meter_readings_location_id",
                table: "meter_readings");

            migrationBuilder.DropIndex(
                name: "ix_meter_readings_type_location_id_polled_at",
                table: "meter_readings");

            migrationBuilder.DropColumn(
                name: "location_id",
                table: "meter_readings");

            migrationBuilder.AddColumn<string>(
                name: "location",
                table: "meter_readings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<JsonDocument>(
                name: "payload",
                table: "meter_readings",
                type: "jsonb",
                nullable: false);

            migrationBuilder.CreateIndex(
                name: "ix_meter_readings_type_location_polled_at",
                table: "meter_readings",
                columns: new[] { "type", "location", "polled_at" },
                descending: new[] { false, false, true });
        }
    }
}
