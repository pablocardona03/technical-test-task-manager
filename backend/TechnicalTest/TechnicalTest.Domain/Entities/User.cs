using TechnicalTest.Domain.Enums;

namespace TechnicalTest.Domain.Entities;

public class User
{
    public int Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; }

    public ICollection<TaskItem> AssignedTasks { get; private set; } = new List<TaskItem>();
    public ICollection<TaskItem> CreatedTasks { get; private set; } = new List<TaskItem>();

    private User()
    {
    }

    public User(string name, string email, UserRole role, bool isActive = true)
    {
        Name = name;
        Email = email;
        Role = role;
        IsActive = isActive;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string name, string email, UserRole role, bool isActive)
    {
        Name = name;
        Email = email;
        Role = role;
        IsActive = isActive;
    }
}
