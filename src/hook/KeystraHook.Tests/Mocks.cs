namespace System.Windows.Forms
{
    public static class Application
    {
        public static void Run() { }
    }
}

namespace System.Windows.Automation
{
    public class AutomationElement
    {
        public static AutomationElement FocusedElement { get; set; }
        public object GetCurrentPropertyValue(object property, bool ignoreDefaultValue) => null;
        public static readonly object IsPasswordProperty = new object();
    }
}
