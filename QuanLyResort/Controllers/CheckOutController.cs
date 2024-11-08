using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
namespace QuanLyResort.Controllers
{
    [Route("checkout")]
    [ApiController]
    public class CheckOutController : ControllerBase
    {
        [HttpGet]
        public IActionResult Index()
        {
            return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "html", "thanhtoan.html"), "text/html");
        }
    }
}
