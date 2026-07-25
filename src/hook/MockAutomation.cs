namespace System.Windows.Automation
{
    public class AutomationElement
    {
        public static AutomationElement FocusedElement { get; } = new AutomationElement();
        public static readonly object IsPasswordProperty = new object();
        public object GetCurrentPropertyValue(object property, bool ignoreDefaultValue)
        {
            return false;
        }
    }
}
namespace System.Windows.Forms
{
    public class Application
    {
        public static void Run() { }
    }
}
