using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;
using System.Globalization;
using System.Linq;
class Portrait {
 const string core="opencv_core453.dll", proc="opencv_imgproc453.dll";
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode)] static extern bool SetDllDirectory(string p);
 [DllImport(core,EntryPoint="??0Mat@cv@@QEAA@HHHPEAX_K@Z")] static extern IntPtr Mat(IntPtr self,int rows,int cols,int t,IntPtr data,UIntPtr stride);
 [DllImport(core,EntryPoint="??0_InputArray@cv@@QEAA@AEBVMat@1@@Z")] static extern IntPtr Input(IntPtr self,IntPtr mat);
 [DllImport(core,EntryPoint="??0_InputOutputArray@cv@@QEAA@AEAVMat@1@@Z")] static extern IntPtr IO(IntPtr self,IntPtr mat);
 [DllImport(proc,EntryPoint="?grabCut@cv@@YAXAEBV_InputArray@1@AEBV_InputOutputArray@1@V?$Rect_@H@1@11HH@Z")] static extern void Grab(IntPtr img,IntPtr mask,IntPtr rect,IntPtr bg,IntPtr fg,int iter,int mode);
 static IntPtr Buf(int n){var p=Marshal.AllocHGlobal(n);Marshal.Copy(new byte[n],0,p,n);return p;}
 static IntPtr Wrap(int h,int w,int type,IntPtr data,int stride,bool input){var m=Mat(Buf(192),h,w,type,data,(UIntPtr)stride);return input?Input(Buf(80),m):IO(Buf(80),m);}
 static byte[] Pixels(Bitmap b, PixelFormat f,int bpp){var d=b.LockBits(new Rectangle(0,0,b.Width,b.Height),ImageLockMode.ReadOnly,f);var v=new byte[b.Width*b.Height*bpp];for(int y=0;y<b.Height;y++)Marshal.Copy(IntPtr.Add(d.Scan0,y*d.Stride),v,y*b.Width*bpp,b.Width*bpp);b.UnlockBits(d);return v;}
 static Bitmap Raster(Image src,int w,int h){var b=new Bitmap(w,h,PixelFormat.Format24bppRgb);using(var g=Graphics.FromImage(b)){g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.DrawImage(src,0,0,w,h);}return b;}
 static int Bound(int x,int m){return x<0?0:x>=m?m-1:x;}
 static float Clip(float a){return Math.Max(0,Math.Min(1,a));}
 static void Main(string[] args){
 SetDllDirectory(@"C:\Program Files\Autodesk\AutoCAD 2024");
 var lines=File.ReadAllLines(args[1]);var meta=lines[0].Split(' ').Select(int.Parse).ToArray();var src=new Bitmap(args[0]);int W=src.Width,H=src.Height;
 float s=Math.Min(1,1500f/Math.Max(W,H));int w=(int)Math.Round(W*s),h=(int)Math.Round(H*s);float sx=(float)w/meta[0],sy=(float)h/meta[1];var pic=Raster(src,w,h);var image=Pixels(pic,PixelFormat.Format24bppRgb,3);
 var path=new GraphicsPath(FillMode.Alternate);foreach(var ring in lines[1].Split('|')){path.AddPolygon(ring.Split(' ').Select(p=>p.Split(',')).Select(v=>new PointF(float.Parse(v[0])*sx,float.Parse(v[1])*sy)).ToArray());}
 var binary=new Bitmap(w,h,PixelFormat.Format24bppRgb);using(var g=Graphics.FromImage(binary)){g.Clear(Color.Black);g.FillPath(Brushes.White,path);}var truth=Pixels(binary,PixelFormat.Format24bppRgb,3);using(var g=Graphics.FromImage(binary)){g.Clear(Color.Black);using(var pen=new Pen(Color.White,meta[2]*2*sx)){pen.LineJoin=LineJoin.Round;g.DrawPath(pen,path);}}
 var band=Pixels(binary,PixelFormat.Format24bppRgb,3);var seed=new byte[w*h];for(int i=0;i<seed.Length;i++)seed[i]=(byte)((truth[i*3]>100?1:0)+(band[i*3]>100?2:0));
 var ip=Buf(image.Length);Marshal.Copy(image,0,ip,image.Length);var mp=Buf(seed.Length);Marshal.Copy(seed,0,mp,seed.Length);
 Grab(Wrap(h,w,16,ip,3*w,true),Wrap(h,w,0,mp,w,false),Buf(16),Wrap(1,65,6,Buf(520),520,false),Wrap(1,65,6,Buf(520),520,false),4,1);
 Marshal.Copy(mp,seed,0,seed.Length);
 // Local color-guided matte. Use the selected pixels as foreground and background samples.
 var ar=new float[w*h];int r=5;
 for(int y=0;y<h;y++)for(int x=0;x<w;x++){int i=y*w+x,a=seed[i]&1;if(band[3*i]==0){ar[i]=a;continue;}int n0=0,n1=0;float[] f=new float[3],b=new float[3];for(int yy=Math.Max(0,y-r);yy<=Math.Min(h-1,y+r);yy+=2)for(int xx=Math.Max(0,x-r);xx<=Math.Min(w-1,x+r);xx+=2){int j=yy*w+xx;bool fg=(seed[j]&1)>0;if(fg)n1++;else n0++;for(int k=0;k<3;k++)(fg?f:b)[k]+=image[3*j+k];}if(n0==0||n1==0){ar[i]=a;continue;}float dot=0,len=0;for(int k=0;k<3;k++){f[k]/=n1;b[k]/=n0;float v=f[k]-b[k];dot+=(image[3*i+k]-b[k])*v;len+=v*v;}float prior=(float)n1/(n1+n0);ar[i]=Clip((dot+220*(0.65f*a+0.35f*prior))/(len+220));}
 var orig=Raster(src,W,H);byte[] rgb=Pixels(orig,PixelFormat.Format24bppRgb,3);var output=new Bitmap(W,H,PixelFormat.Format32bppArgb);var bits=output.LockBits(new Rectangle(0,0,W,H),ImageLockMode.WriteOnly,PixelFormat.Format32bppArgb);var row=new byte[W*4];int idx=int.Parse(args[3]);
 for(int y=0;y<H;y++){double fy=(y+.5)*h/H-.5;int ya=Bound((int)Math.Floor(fy),h),yb=Bound(ya+1,h);float dy=(float)Math.Max(0,fy-ya);for(int x=0;x<W;x++){double fx=(x+.5)*w/W-.5;int xa=Bound((int)Math.Floor(fx),w),xb=Bound(xa+1,w);float dx=(float)Math.Max(0,fx-xa);float a=(ar[ya*w+xa]*(1-dx)+ar[ya*w+xb]*dx)*(1-dy)+(ar[yb*w+xa]*(1-dx)+ar[yb*w+xb]*dx)*dy;
 if(idx==3){float xx=x*550f/W,yy=y*824f/H;float edge=585+17*(float)Math.Exp(-Math.Pow((xx-365)/52,2));float fade=Clip((edge+4-yy)/16);a*=fade;}
 if(idx==6){float xx=x*1025f/W,yy=y*1534f/H;float edge=1490-30*(float)Math.Cos((xx-370)/110);a*=Clip((edge+40-yy)/68);}
 int j=3*(y*W+x),u=4*x;
 if(idx==2 && y<775 && band[3*(ya*w+xa)]>0){
   float red=rgb[j+2],green=rgb[j+1],blue=rgb[j];
   float excess=(green-blue)-1.45f*Math.Max(0,red-green);
   a*=1-Clip((excess-9)/15f);
 }
 row[u]=rgb[j];row[u+1]=rgb[j+1];row[u+2]=rgb[j+2];row[u+3]=(byte)Math.Round(255*a);}
 Marshal.Copy(row,0,IntPtr.Add(bits.Scan0,y*bits.Stride),row.Length);}output.UnlockBits(bits);output.Save(args[2],ImageFormat.Png);Console.WriteLine(W+"x"+H);}
}
