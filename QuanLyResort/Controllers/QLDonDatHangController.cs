using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace QuanLyResort.Controllers
{
    [Route("admin/dondatphong")]
    [ApiController]
    public class QLDonDatHangController : ControllerBase
    {
        [HttpGet]
        public IActionResult Index()
        {
            return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "html", "template-admin", "ql_dondatphong.html"), "text/html");
        }
    }
}
