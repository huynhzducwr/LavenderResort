using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace QuanLyResort.Controllers
{
    [Route("admin/danhmucphong")]
    [ApiController]
    public class QLDanhMucPhongController : ControllerBase
    {
        [HttpGet]
        public IActionResult Index()
        {
            return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "html", "template-admin", "qldanhmucphong.html"), "text/html");
        }
    }
}
