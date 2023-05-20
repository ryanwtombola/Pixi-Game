export class Line extends PIXI.Graphics {
  constructor(points, lineSize, lineColor) {
    super();

    var s = (this.lineWidth = lineSize || 5);
    var c = (this.lineColor = lineColor || "0x000000");

    this.points = points;

    this.lineStyle(s, c);

    this.moveTo(points[0].x, points[0].y);
    this.lineTo(points[1].x, points[1].y);
  }

  updatePoints(p) {
    var points = (this.points = p.map(
      (val, index) => val || this.points[index]
    ));

    var s = this.lineWidth;
    var c = this.lineColor;

    this.clear();

    for (let i = 0; i < points.length - 1; i++) {
      this.lineStyle(s, c, lerp(0.8, 0, i / (points.length - 1)));
      this.moveTo(points[i].x, points[i].y);
      this.lineTo(points[i + 1].x, points[i + 1].y);
    }
  }
}
