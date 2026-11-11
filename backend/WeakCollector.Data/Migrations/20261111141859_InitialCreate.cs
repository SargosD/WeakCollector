using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WeakCollector.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "meter_readings",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    poll_id = table.Column<Guid>(type: "uuid", nullable: false),
                    polled_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    location = table.Column<string>(type: "text", nullable: false),
                    payload = table.Column<JsonDocument>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_meter_readings", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_meter_readings_poll_id",
                table: "meter_readings",
                column: "poll_id");

            migrationBuilder.CreateIndex(
                name: "ix_meter_readings_polled_at",
                table: "meter_readings",
                column: "polled_at");

            migrationBuilder.CreateIndex(
                name: "ix_meter_readings_type_location_polled_at",
                table: "meter_readings",
                columns: new[] { "type", "location", "polled_at" },
                descending: new[] { false, false, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "meter_readings");
        }
    }
}
