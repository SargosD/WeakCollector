using System.ComponentModel.DataAnnotations;

namespace WeakCollector.Data.Configuration;

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    [Required]
    public string ConnectionString { get; set; } = string.Empty;
}
